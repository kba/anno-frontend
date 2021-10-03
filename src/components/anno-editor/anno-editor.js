/*
 * ### anno-editor
 *
 * The editor has three modes: `create`, `reply` and `revise` that represent
 * the function of the anno-store to be used on `save`
 *
 * Properties:
 *
 * Events:
 *
 * - `close-editor`: The editor was closed
 * - `removed(id)`: Annotation `id` was removed
 *
 */

const getOwn = require('getown');

const eventBus = require('../../event-bus.js');
const validateEditorFields = require('./validateEditorFields.js');
const decideAnnoTarget = require('./decideAnnoTarget.js');

function soon(f) { return setTimeout(f, 1); }

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/api'),
        require('@/mixin/prefix'),
    ],
    template: require('./anno-editor.html'),
    style: require('./anno-editor.scss'),
    props: {
        editorId: {type: String, default: 'anno-editor'},
        enableTabTags: {type: Boolean, default: false},
    },
    created() {
        // TODO Move these to store maybe??
        const editorOpenCssClass = 'has-annoeditor-showing';
        eventBus.$on('create', this.create)
        eventBus.$on('reply', this.reply)
        eventBus.$on('revise', this.revise)
        eventBus.$on('remove', this.remove)
        eventBus.$on('discard', this.discard)
        eventBus.$on('save', this.save)
        eventBus.$on('close-editor', () => {
          document.body.classList.remove(editorOpenCssClass);
        });
        eventBus.$on('open-editor', () => {
          document.body.classList.add(editorOpenCssClass);
          const editor = this;
          soon(() => editor.$refs.tablist.switchToNthTab(1));

          const { targetImage, zoneEditor } = editor;
          if (zoneEditor) {
            try {
              if (zoneEditor.shouldHaveHadAnyImageEverBefore) {
                // Without an image loaded, the first reset() call would
                // log a confusing error message about the image not having
                // been loaded yet.
                // :TODO: Fix upstream.
                zoneEditor.reset();
              }
              if (targetImage) {
                zoneEditor.shouldHaveHadAnyImageEverBefore = true;
                zoneEditor.loadImage(targetImage);
              }
            } catch (zoneEditErr) {
              console.error('Zone editor init failure:', zoneEditErr);
            }
          }
        })
    },
    mounted() {
      const editor = this;
      const { targetImage, zoneEditor } = editor;
      if (targetImage) {
        const { thumbnail } = editor.$refs.preview.$refs;
        zoneEditor.$on('load-image', () => {
          editor.loadSvg();
        });
        zoneEditor.$on('svg-changed', svg => {
          thumbnail.reset();
          thumbnail.loadSvg(editor.svgTarget.selector.value);
        });
      }
    },
    computed: {
        id()              {return this.$store.state.editing.id},
        targetImage()     {return this.$store.state.targetImage},
        targetThumbnail() {return this.$store.state.targetThumbnail},
        targetSource()    {return this.$store.state.targetSource},
        svgTarget()       {return this.$store.getters.svgTarget},
        zoneEditor()      {return this.$refs.zoneEditor},

        stubbedAnnotationForPreview() {
          const editor = this;
          const { l10n } = editor;
          const orig = editor.$store.state.editing;
          const now = Date.now();
          const ann = {
            creator: l10n('generic_author_name'),
            created: now,
            modified: now,
            ...orig,
          };
          return ann;
        },

        editMode: {
          get() {return this.$store.state.editMode},
          set(newVal) { this.$store.commit('SET_EDIT_MODE', newVal); },
        },

        title: {
          get() { return this.$store.state.editing.title; },
          set(newVal) { this.$store.commit('SET_TITLE', newVal); },
        },

        titleRequired() {
          return !this.$store.state.editing.replyTo;
        },

    },
    methods: {

        save() {
            const editor = this;
            const {
              $store,
              api,
              editMode,
              l10n,
            } = editor;
            const anno = $store.state.editing;

            if (!validateEditorFields(editor)) { return; }

            if (editMode === 'create') {
              if (!window.confirm(l10n('confirm_publish'))) { return; }
            }

            function whenSaved(err, newAnno) {
                if (err) {
                    console.error("Error saving annotation", err)
                    return
                }
                $store.commit('RESET_ANNOTATION')
                eventBus.$emit('close-editor')
                $store.dispatch('fetchList')
            }

            const legacyPreArgs = getOwn({
              // :TODO: Improve API so these are no longer required. [ubgl:136]
              create: [],
              reply:  [anno.replyTo],
              revise: [anno.id],
            }, editMode);
            if (!legacyPreArgs) {
              throw new Error('Unsupported editMode: ' + editMode);
            }
            api[editMode].call(api, ...legacyPreArgs, anno, whenSaved);
            // ^- .call probably required because the API seems to
            //    really be "this" broken.
        },

        loadSvg() {
            const svg = (this.svgTarget && this.svgTarget.selector.value) ? this.svgTarget.selector.value : false
            // console.log({svg})
            if (svg) this.zoneEditor.loadSvg(svg)
        },

        discard() {
            this.$store.commit('RESET_ANNOTATION')
            eventBus.$emit('close-editor')
        },

        remove(annoOrId) {
          if (!window.confirm(this.l10n('confirm_delete'))) { return; }
          const annoId = (annoOrId.id || annoOrId);
          const self = this;
          const { api, $store } = self;
          api.delete(annoId, (err) => {
            if (err) { return console.error(err); }
            console.debug('API confirms anno as removed:', annoId);
            eventBus.$emit('removed', annoId);
            $store.dispatch('fetchList');
            self.discard();
          });
        },

        create(annotation) {
          const editor = this;
          const { commit, state } = editor.$store;
          commit('SET_EDIT_MODE', 'create')
          commit('RESET_ANNOTATION')
          commit('SET_COLLECTION', this.$store.state.collection)
          commit('ADD_TARGET', decideAnnoTarget(state));
          eventBus.$emit('open-editor')
        },

        reply(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'reply')
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('SET_HTML_BODY_VALUE', '')
            this.$store.commit('ADD_TARGET', {id: annotation.id, scope: this.targetSource})
            this.$store.commit('ADD_MOTIVATION', 'replying')
            this.$store.commit('SET_REPLY_TO', annotation.id)
            eventBus.$emit('open-editor')
        },

        revise(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'revise')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('REPLACE_ANNOTATION', annotation)
            eventBus.$emit('open-editor')
        },

        onSvgChanged(svg) {
            this.$store.commit('SET_SVG_SELECTOR', {svg, source: this.$store.state.targetImage})
        }
    }
}
