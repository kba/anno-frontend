'use strict';

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
const licensesByUrl = require('../../license-helper.js').byUrl;
const toggleDetailBar = require('./toggleDetailBar.js');
const xrxUtilsUtils = require('./xrxUtilsUtils.js');
const revisionsProps = require('./revisionsProps.js');


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
 * - `purlId` The URL of the persistently adressed annotation.
 *   This is the legacy solution for highlighting an annotation when the
 *   annoApp was loaded from a PURL redirect.
 * - `collapseInitially`: Whether the anntotation should be collapsed after
 *   first render
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
      require('../../mixin/annoUrls.js'),
      require('../../mixin/api'),
      require('../../mixin/auth'),
      require('../../mixin/dateFmt'),
      require('../../mixin/l10n'),
      require('../../mixin/prefix'),
    ],

    data() {
      const el = this;
      const anno = (el.annotation || false);
      const initData = {
        bootstrapOpts: bootstrapCompat.sharedConfig,
        cachedIiifLink: '',
        collapsed: el.collapseInitially,
        currentVersion: el.initialAnnotation,
        highlighted: false,
        mintDoiError: null,
        showMintDoiError: null,
        detailBarClipCopyBtnCls: 'pull-right',
        doiResolverBaseUrl: 'https://doi.org/',
        latestRevisionDoi: anno.doi,
      };
      return initData;
    },

  props: {
    annotation: { type: Object, required: true },
    purlId: { type: String, required: false },
    asReply: { type: Boolean, default: false },
    // ^-- Controls whether comment is collapsible or not
    collapseInitially: { type: Boolean, default: false },
    acceptEmptyAnnoId: { type: Boolean, default: false },
  },

  beforeCreate() {
    this.dataApi = bindDataApi(this);
  },

  mounted() {
    const viewer = this;
    viewer.$el.vue = () => viewer;

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
          const licInfo = (licensesByUrl.get(licUrl) || false);
          return licInfo;
        },

        currentRevisionDoi() { return this.annotation.doi || ''; },

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
          return this.annoIdToPermaUrl(this.annotation.id);
        },

        slug() {
            if (!this.annotation.id) return 'unsaved-annotation-' + Date.now()
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
        newestVersion() {
          const versions = this.annotation.hasVersion
          if (!versions || versions.length <= 1) {
            return this.annotation
          } else {
            return versions[versions.length - 1]
          }
        },
    },

    methods: {
        toggleDetailBar,

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
          const jq = window.jQuery;
          const popoverTrigger = jq(event.target);
          // TODO remove the popup init from here
          if (!("mintDoiPopoverCreated" in this) || !this.mintDoiPopoverCreated) {
            console.log("init popover")
            popoverTrigger.popover()
            popoverTrigger.on('shown.bs.popover', (/* ev */) => {
              const popoverDiv = document.getElementById(popoverTrigger.attr("aria-describedby"))
              Array.from(popoverDiv.querySelectorAll("[data-click]")).forEach(button => {
                const clickAttr = jq(button).data('click');
                if (clickAttr == 'mintDoi') {
                  jq(button).on('click', () => {
                    popoverTrigger.popover('hide')
                    vm.mintDoi().catch( (error) => {
                      vm.mintDoiError = error
                    })
                  })
                }
                else {
                  jq(button).on('click', () => { popoverTrigger.popover('hide') })
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
          function switchVersionInplace() {
            revisionsProps.forEach(function updateInplace(key) {
              deepStateAnnoShortcut[key] = updates[key];
            });
          }
          viewer.$store.commit('INJECTED_MUTATION', [switchVersionInplace]);
        },

        isOlderVersion() {
          return this.newestVersion.created !== this.annotation.created
        },

        versionIsShown(version) {
          return version.created === this.created
        },

        renderIiifLink() {
          const viewer = this;
          viewer.cachedIiifLink = xrxUtilsUtils.calcIiifLink(viewer);
        },

        doi2url(doi) { return this.doiResolverBaseUrl + doi; },

    },
}
