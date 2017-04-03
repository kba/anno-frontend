module.exports = {
    props: {
        initialAnnotation: {type: Object, required: true},
        l10n: {type: Object, required: true},
        purl: {type: String, required: true},
    },
    template: require('./anno-comment.html'),
    style: require('./anno-comment.css'),
    components: {
        'bootstrap-button': require('./bootstrap-button'),
    },
    computed: {
        // TODO this is create-or-get we just need list
        // htmlTextualBody() {
        //     if (!this.annotation.body) this.annotation.body = {type: 'TextualBody', format: 'text/html', value: ''}
        //     if (!Array.isArray(this.annotation.body)) this.annotation.body = [this.annotation.body]
        //     var ret = this.annotation.body
        //         .find(body => body.type === 'TextualBody' && body.format === 'text/html')
        //     if (!ret) {
        //         ret = {type: 'TextualBody', format: 'text/html', value: ''}
        //         this.annotation.body.push(ret)
        //     }
        //     return ret
        // },
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
            annotation: this.initialAnnotation
        }
    },
    mounted() {
    },
    methods: {
    },
}
