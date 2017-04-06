const $ = require('jquery')
const _dateformat = require('dateformat')
const eventBus = require('../event-bus')
const {
    numberOf,
    firstHtmlBody, simpleTagBodies, semanticTagBodies, svgTarget,
    setToVersion,
} = require('../anno-utils.js')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/acl'),
    ],
    // necessary for nesting
    name: 'anno-viewer',
    props: {
        annotation: {type: Object, required: true},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
        collapseInitially: {type: Boolean},
    },
    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.css'),
    // beforeMount() {
    //     this.annotation = this.$store.state.annotationList[this.listIndex]
    // },
    mounted() {
        $('[data-toggle="popover"]', this.$el).popover(); 
        $(".panel-collapse", this.$el).on("hide.bs.collapse", () => $('[data-toggle="collapse"]', this.$el).addClass('collapsed'))
        $(".panel-collapse", this.$el).on("show.bs.collapse", () => $('[data-toggle="collapse"]', this.$el).removeClass('collapsed'))
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
        }
    },
    methods: {
        revise()    { return eventBus.$emit('revise', this.annotation) },
        comment()   { return eventBus.$emit('comment', this.annotation) },

        dateformat(date) { return date ? _dateformat(date, 'dd.mm.yyyy hh:MM:ss') : '' },
        collapse(collapseState) { $(".collapse", this.$el).collapse(collapseState) },
        numberOf(k) { return numberOf(this.annotation, k) },
        setToVersion(newState) {
            setToVersion(this.annotation, newState)
        }
    },
}
