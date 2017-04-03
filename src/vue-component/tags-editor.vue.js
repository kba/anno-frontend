module.exports = {
    template: require('./tags-editor.vue.html'),
    props: {
        annotation: {type: Object, required: true},
        l10n: {type: Object, required: true},
    },
    computed: {
        bodies() {
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            return this.annotation.body.filter(body =>
                body.motivation === 'tagging')
        },
    },
    components: {
        'bootstrap-button': require('./bootstrap-button.vue')
    },
    methods: {
        add() {
            console.log("Add simple tag")
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            const newBody = {type: 'TextualBody', motivation: 'tagging', value: ''}
            this.annotation.body.push(newBody)
        },
        remove(toDelete) {
            console.log("Delete simple tag", toDelete)
            const toDeleteIndex = this.annotation.body.indexOf(toDelete)
            this.annotation.body.splice(toDeleteIndex, 1)
        },
    }
}
