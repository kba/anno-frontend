const $ = require('jquery')
const _dateformat = require('dateformat')

module.exports = {
    // necessary for nesting
    name: 'anno-viewer',
    props: {
        initialAnnotation: {type: Object, required: true},
        l10n: {type: Object, required: true},
        purl: {type: String, required: true},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
    },
    template: require('./anno-viewer.html'),
    style: require('./anno-viewer.css'),
    components: {
        'bootstrap-button': require('./bootstrap-button'),
    },
    computed: {
        htmlTextualBody() {
            var ret = {}
            if (Array.isArray(this.annotation.body))
                ret = this.annotation.body.find(body => body.type === 'TextualBody' && body.format === 'text/html')
            else if (typeof this.annotation.body === 'object') {
                if (this.annotation.body.type === 'TextualBody' && this.annotation.body.format === 'text/html')
                    ret = this.annotation
            } else ret = {}
            return ret
        },
        tagBodies() {
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            return this.annotation.body.filter(body =>
                body.type === 'TextualBody' && body.motivation === 'tagging')
        },
        semtagBodies() {
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            return this.annotation.body.filter(body => 
                body.id && (
                   body.motivation === 'linking'
                || body.motivation === 'identifying'
                || body.motivation === 'classifying'))
        },
        slug() {
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
    },
    data() {
        return {
            annotation: this.initialAnnotation,
            currentVersion: this.initialAnnotation,
        }
    },
    mounted() {
        $('[data-toggle="popover"]', this.$el).popover(); 
    },
    methods: {
        dateformat(date) {
            if (!date) return ''
            return _dateformat(date, 'dd.mm.yyyy hh:MM:ss')
        },
        numberOf(k) {
            return Array.isArray(this.annotation[k]) ? this.annotation[k].length
                : this.annotation[k] ? 1
                : 0
        },
        setToVersion(version) {
            for (let prop in version) {
                if (['hasVersion', 'hasReply'].indexOf(prop) !== -1) {
                    continue;
                }
                this.annotation[prop] = version[prop]
            }
        }
    },
}
