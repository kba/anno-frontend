const jQuery = require('jquery');
const getOwn = require('getown');
const XrxUtils = require('semtonotes-utils');
const {
    relationLinkBody,
    textualHtmlBody,
    simpleTagBody,
    semanticTagBody,
    svgSelectorResource
} = require('@kba/anno-queries')

const bootstrapCompat = require('../../bootstrap-compat.js');
const eventBus = require('../../event-bus.js');
const bindDataApi = require('./dataApi.js');
const popoverHelper = require('../../popover-helper.js');
const licensesByUrl = require('../../license-helper.js').byUrl;


/**
 * ### anno-viewer
 *
 * Show an annotation as a bootstrap panel.
 *
 * #### Props
 *
 * - **`annotation`**: The annotation this viewer shows
 * - `asReply`: Whether the annotation should be displayed as a reply (no
 *   colapsing, smaller etc.)
 * - `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
 *   be replaced by the slug of the annotation
 * - `purlId` The URL of the persistently adressed annotation
 * - `collapseInitially`: Whether the anntotation should be collapsed after
 *   first render
 * - `imageWidth`: Width of the image this annotation is about, if any
 * - `imageHeight`: Height of the image this annotation is about, if any
 * - `iiifUrlTemplate`: URL template for the IIIF link if this annotation
 *   contains zones about an image. The string `{{ iiifRegion }}` is replaced
 *   with a IIIF Image API conformant region specification that contains the
 *   bounding box of all zones in this annotation.
 *
 * #### Events
 *
 * - `revise`: This annotation should be opened in an editor for revision
 * - `reply`: A new annotation as a reply to this annotation should be opened in an editor
 * - `remove`: This annotation should be removed from the store
 * - `startHighlighting`: Start highlighting this annotation
 * - `stopHighlighting`: Stop highlighting this annotation
 * - `mouseenter`: The mouse cursor is now on this annotation
 * - `mouseleave`: The mouse cursor has left this annotation
 * - `setToVersion`: Reset the currently edited annotation to the revision passed
 */

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

module.exports = {
    name: 'anno-viewer', // necessary for nesting

    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.scss'),

    mixins: [
      require('../../mixin/api'),
      require('../../mixin/auth'),
      require('../../mixin/dateFmt'),
      require('../../mixin/l10n'),
      require('../../mixin/prefix'),
    ],

    props: {
        annotation: {type: Object, required: true},
        purlTemplate: {type: String, required: false},
        purlId: {type: String, required: false},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
        collapseInitially: {type: Boolean, default: false},
        imageWidth: {type: Number, default: -1},
        imageHeight: {type: Number, default: -1},
        iiifUrlTemplate: {type: String, default: null},
        thumbStrokeColor: {type: String, default: '#090'},
        thumbFillColor: {type: String, default: '#090'},
        acceptEmptyAnnoId: { type: Boolean, default: false },
    },

  beforeCreate() {
    this.toplevelDoi = this.$options.propsData.annotation.doi;
    this.dataApi = bindDataApi(this);
  },

  mounted() {
    const viewer = this;

    viewer.iiifLink = viewer._iiifLink();

    // React to highlighting events startHighlighting / stopHighlighting / toggleHighlighting
    ;['start', 'stop', 'toggle'].forEach(state => {
      const methodName = `${state}Highlighting`;
      // console.debug('reg $on', { methodName, ourId: viewer.id, elem: viewer.$el });
      eventBus.$on(methodName, function manageHighlight(subjectId, expand) {
        const ourId = viewer.id;
        // console.debug('$on cb', { methodName, ourId, subjectId });
        if (!ourId) { return; } // early init
        if (subjectId !== ourId) { return; }
        viewer[methodName](expand);
      });
    })

    // Expand this annotation
    eventBus.$on('expand', (id) => {
      if (id !== viewer.id) return
      viewer.collapse(false)
      const rootId = viewer.id.replace(/[~\.][~\.0-9]+$/, '')
      if (rootId !== id) eventBus.$emit('expand', rootId)
    })

    viewer.toplevelCreated = viewer.annotation.modified;
    viewer.setToVersion(viewer.newestVersion);
  },

    computed: {
        id()                 {return this.annotation.id},
        title()              {return this.annotation.title},
        firstHtmlBody()      {return textualHtmlBody.first(this.annotation)},
        simpleTagBodies()    {return simpleTagBody.all(this.annotation)},
        semanticTagBodies()  {return semanticTagBody.all(this.annotation)},
        relationLinkBodies() {return relationLinkBody.all(this.annotation)},
        svgTarget()          {return svgSelectorResource.first(this.annotation)},

        targetFragment() { return (this.dataApi('findTargetFragment') || ''); },

        creatorsList() {
          const { creator } = this.annotation;
          if (!creator) { return []; }
          return [].concat(creator).filter(Boolean);
        },

        currentLicense() {
          const licUrl = this.annotation.rights;
          return licInfo = (licensesByUrl.get(licUrl) || false);
          return licInfo;
        },

        licenseTitleOrUnknown() {
          return (this.currentLicense.title
            || this.l10n('license_unknown'));
        },

        problemsWarningText() {
          const viewer = this;
          const anno = (viewer.annotation || false);
          const { l10n } = viewer;
          const probs = [];

          (function checkExpectedProps() {
            const expected = [
              'title',
              (viewer.acceptEmptyAnnoId ? null : 'id'),
            ];
            const miss = l10n('missing_required_field') + ' ';
            expected.forEach(function check(prop) {
              if (!prop) { return; }
              if (anno[prop]) { return; }
              probs.push(miss + l10n('annofield_' + prop, prop));
            });
          }());
          if (!probs.length) { return ''; }
          return l10n('error:') + ' ' + probs.join('; ');
        },

        purl() {
          const { id, purlTemplate } = this;
          if (!id) { return ''; }
          if (!purlTemplate) { return id; }
          const slots = {
            slug: String(id || '').split(/\//).slice(-1)[0],
            // :TODO: ^- Improved formula for original behavior, but shouldn't
            //    this actually be this.slug()? [ubhd:148]
          };
          function getSlot(m, k) { return getOwn(slots, k, m); }
          const purl = purlTemplate.replace(/\{{2}\s*(\w+)\s*\}{2}/g, getSlot);
          return purl;
        },

        wbrPurl() { return this.purl.replace(/([\/?&]+)/g, '\u200b$1'); },

        slug() {
            if (!this.annotation.id) return 'unsaved-annotation-' + Date.now()
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
        isPurl() {
            return this.annotation.id === this.purlId
        },
        newestVersion() {
          const versions = this.annotation.hasVersion
          if (!versions || versions.length <= 1) {
            return this.annotation
          } else {
            return versions[versions.length - 1]
          }
        },
        doiPopup() {
          const {annotation, toplevelDoi, l10n} = this
          let ret = `
            `
          ret += l10n('doi.of.annotation')
          ret += ': <br/>'
          ret += `
            <button data-clipboard-text="https://doi.org/${toplevelDoi}" class="btn btn-default btn-outline-secondary btn-sm">
              <span class="fa fa-clipboard"></span>
              <span class="label label-success" style="display: none">${l10n("copied_to_clipboard")}</span>
            </button>
            <a href="https://doi.org/${toplevelDoi}">
              https://doi.org/${toplevelDoi}
            </a>
          `
          // console.log(annotation.doi, toplevelDoi)
          const versionDoi = annotation.doi
          if (versionDoi) {
            ret += '<br/>'
            ret += l10n('doi.of.annotation.revision')
            ret += ':<br/>'
            ret += `
            <button data-clipboard-text="https://doi.org/${versionDoi}" class="btn btn-default btn-outline-secondary btn-sm">
              <span class="fa fa-clipboard"></span>
              <span class="label label-success" style="display: none">${l10n("copied_to_clipboard")}</span>
            </button>
            <a href="https://doi.org/${versionDoi}">
              https://doi.org/${versionDoi}
            </a>
            `
          }
          return ret
        }
    },
    data() {
        return {
            mintDoiError: null,
            showMintDoiError: null,
            iiifLink: '',
            currentVersion: this.initialAnnotation,
            highlighted: false,
            collapsed: this.collapseInitially,
            bootstrapOpts: bootstrapCompat.sharedConfig,
        }
    },
    methods: {
        revise()     {return eventBus.$emit('revise', this.annotation)},
        reply()      {return eventBus.$emit('reply',  this.annotation)},
        remove()     {return eventBus.$emit('remove', this.annotation)},

        makeEventContext() {
          const viewer = this;
          return {
            annoId: viewer.id,
            domElem: viewer.$el,
            dataApi: viewer.dataApi,
            getVueBoundAnno() { return viewer.annotation; },
            getAnnoJson() { return jsonDeepCopy(viewer.annotation); },
          };
        },

        targetFragmentButtonClicked() {
          const ev = {
            ...this.makeEventContext(),
            fragment: this.targetFragment,
            button: this.$refs.targetFragmentButton,
          };
          // console.debug('emit fragmentButtonClicked:', ev);
          eventBus.$emit('targetFragmentButtonClicked', ev);
        },

        showMintDoiPopover(event) {
          const vm = this
          const popoverTrigger = $(event.target)
          // TODO remove the popup init from here
          if (!("mintDoiPopoverCreated" in this) || !this.mintDoiPopoverCreated) {
            console.log("init popover")
            popoverTrigger.popover()
            popoverTrigger.on('shown.bs.popover', (ev) => {
              const popoverDiv = document.getElementById(popoverTrigger.attr("aria-describedby"))
              Array.from(popoverDiv.querySelectorAll("[data-click]")).forEach(button => {
                const clickAttr = $(button).data('click')
                if (clickAttr == 'mintDoi') {
                  $(button).on('click', () => {
                    popoverTrigger.popover('hide')
                    vm.mintDoi().catch( (error) => {
                      vm.mintDoiError = error
                    })
                  })
                }
                else {
                  $(button).on('click', () => { popoverTrigger.popover('hide') })
                }
              })
            })
            this.mintDoiPopoverCreated = true
          }
          popoverTrigger.popover('toggle')
        },

        mintDoi() {
          // TODO It would be much nicer to implement a Vuex store action
          const api = this.api
          return new Promise((resolve, reject) => {
            api.mintDoi(this.id, (err, ...args) => {
              if (err) {
                console.log("mintDOI error", {err})
                reject(err)
              } else {
                console.log("mintDOI response", {err, args})
                // TODO Do not reload the complete list. Only update this annotation.
                this.$store.dispatch('fetchList')
                resolve(...args)
              }
            })
          })
        },
        mouseenter() {
            this.startHighlighting();
            eventBus.$emit('mouseenter', this.makeEventContext());
        },
        mouseleave() {
            this.stopHighlighting();
            eventBus.$emit('mouseleave', this.makeEventContext());
        },

        startHighlighting(expand)  {
            this.highlighted = true
            if (expand) eventBus.$emit('expand', this.id, true)
        },
        stopHighlighting()   {this.highlighted = false},
        toggleHighlighting() {this.highlighted = ! this.highlighted},
        collapse(collapseState) {
            this.collapsed = collapseState === 'toggle' ? ! this.collapsed : collapseState === 'hide'
        },

        setToVersion(updates) {
          const viewer = this;
          /*
            Usually we'd expect the function switchVersionInplace
            below to have a "state" argument and modify data inside
            that. Our annotation would be buried deeply somewhere in
            there in the anno-list, and we'd have to find it by ID
            or something.

            Except when the viewer is used in the editor preview, of
            course. So we'd have to track our viewer's pedigree, too.

            The proper way would be to not modify the annotation in
            place, but rather have a abstraction layer that shows data
            from the selected version. That would require a major
            rewrite though, and extensive testing for whether all
            elements are updated properly.

            Fortunately, in current vuex (v3.6.2), we can ignore the
            mutation function's arguments and just use our shortcut,
            because it points to the same object:
          */
          const deepStateAnnoShortcut = viewer.annotation;
          const affectedProps = [
            'body',
            'created',
            'modified',
            'target',
            'title',
            'doi',
          ];
          function switchVersionInplace() {
            affectedProps.forEach(function updateInplace(key) {
              deepStateAnnoShortcut[key] = updates[key];
            });
          }
          viewer.$store.commit('INJECTED_MUTATION', [switchVersionInplace]);
        },

        isOlderVersion()     {
          return this.newestVersion.created !== this.annotation.created
        },

        versionIsShown(version) {
          return version.created === this.created
        },

        _iiifLink() {
            if (! this.svgTarget || this.imageHeight <= 0 || this.imageWidth <= 0 || ! this.iiifUrlTemplate) {
                // console.error("Could not determine width / height of img")
                return ''
            }
            // console.log(this.svgTarget, this.imageHeight,  this.imageWidth, this.iiifUrlTemplate)
            const svg = this.svgTarget.selector.value
            let svgWidth
            svg.replace(/width="(\d+)"/, (_, w) => svgWidth = parseInt(w))

            const $container = $('<div class="annoeditor-iiif-canvas" style="display:none"></div>').appendTo(this.$el).get(0)
            const drawing = XrxUtils.createDrawing($container, 1, 1)
            XrxUtils.drawFromSvg(svg, drawing, {
                absolute: true,
                grouped: false,
            })
            let scale = svgWidth / this.imageWidth
            // console.log({svgWidth, scale, svg, imageWidth: this.imageWidth, imageHeight: this.imageHeight})
            let [[x, y], [x2, y2]] = XrxUtils.boundingBox(drawing)
            $container.remove()


            let w = (x2 - x)
            let h = (y2 - y)
            ;[x, w] = [x, w].map(_ => _ / this.imageWidth)
            ;[y, h] = [y, h].map(_ => _ / this.imageHeight)
            ;[x, y, w, h] = [x, y, w, h].map(_ => _ / scale * 100)
            return this.iiifUrlTemplate.replace(`{{ iiifRegion }}`, `pct:${x},${y},${w},${h}`)
        },

        toggleDetailBar(ev) {
          const viewer = this;
          const trigger = jQuery(ev.target).closest('button');
          const barName = trigger.data('detailbar');
          if (!barName) { throw new Error('No detailbar name'); }
          const detBars = viewer.$refs.detailbars;
          const openCls = 'active';
          const barElem = detBars.querySelector('.detailbar-' + barName);
          if (!barElem) { throw new Error('No such detailbar: ' + barName); }
          const wasOpen = trigger.hasClass(openCls);
          const buttonAndBar = jQuery([trigger[0], barElem]);
          // console.debug('toggleDetailBar', barName, wasOpen, buttonAndBar);
          if (wasOpen) {
            buttonAndBar.removeClass(openCls);
          } else {
            buttonAndBar.addClass(openCls);
          }
        },

    },
}
