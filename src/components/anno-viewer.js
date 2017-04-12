const $ = require('jquery')
const _dateformat = require('dateformat')
const {
    numberOf,
    firstHtmlBody, simpleTagBodies, semanticTagBodies, svgTarget,
    setToVersion,
} = require('@kba/anno-util')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/prefix'),
    ],
    name: 'anno-viewer', // necessary for nesting
    props: {
        annotation: {type: Object, required: true},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
        collapseInitially: {type: Boolean, default: false},
        dateFormat: {type: String, default: 'dd.mm.yyyy hh:MM:ss'},
    },
    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.scss'),
    mounted() {

        // Show popover with persistent URL
        $('[data-toggle="popover"]', this.$el).popover(); 

        // React to highlighting events
        ;['start', 'stop', 'toggle'].forEach(state => {
            const method = `${state}Highlighting`
            this.$root.$on(method, (id) => { if (id == this.id) this[method]() })
        })
    },
    computed: {
        firstHtmlBody()     { return firstHtmlBody(this.annotation) },
        simpleTagBodies()   { return simpleTagBodies(this.annotation) },
        semanticTagBodies() { return semanticTagBodies(this.annotation) },
        id() { return this.annotation.id },
        slug() {
            if (!this.annotation.id) return 'unsaved-annotation-' + Date.now()
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
    },
    data() {
        return {
            currentVersion: this.initialAnnotation,
            highlighted: false,
            collapsed: this.collapseInitially,
        }
    },
    methods: {
        revise()     { return this.$root.$emit('revise', this.annotation) },
        reply()      { return this.$root.$emit('reply', this.annotation) },
        remove()     { return this.$root.$emit('remove', this.annotation) },
        mouseenter() { return this.$root.$emit("startHighlighting", this.id) },
        mouseleave() { return this.$root.$emit("stopHighlighting", this.id) },

        startHighlighting() { this.highlighted = true },
        stopHighlighting() { this.highlighted = false },
        toggleHighlighting() { this.highlighted = ! this.highlighted },

        dateformat(date) { return date ? _dateformat(date, this.dateFormat) : '' },
        collapse(collapseState) {
            this.collapsed = collapseState === 'toggle' ? ! this.collapsed : collapseState === 'hide'
        },
        numberOf(k) { return numberOf(this.annotation, k) },
        setToVersion(newState) {
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('REPLACE_ANNOTATION', newState)
        }
    },
}
