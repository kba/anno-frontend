module.exports = {
    template: require('./tag-editor.vue.html'),
    props: {
        annotation: {type: Object, required: true},
        _editing: {type: Object, default: () => {return {}}},
    },
    // data: () => {return{
    //     _editing: {}
    // }},
    computed: {
        tagBodies() {
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            return this.annotation.body
                .filter(body => body.motivation === 'tagging')
        },
        editing() {
            // console.log(JSON.stringify(this._editing))
            for (let tagBodyIndex in this.tagBodies) {
                if (!(tagBodyIndex in this._editing)) {
                    this._editing[tagBodyIndex] = false;
                }
            }
            return this._editing
        },
        nrEditing() {
            console.log("nrEditing", this._editing)
            return Object.keys(this._editing).map(k => {console.log(k);return k}).filter(k => this._editing[k]).length
        }
    },
    components: {
        'bootstrap-button': require('./bootstrap-button.vue')
    },
    methods: {
        add() {
            console.log('add called')
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            const newBody = {motivation: 'tagging', value: ''}
            this.annotation.body.push(newBody)
        },
        edit(bodyIndex) {
            const body = this.tagBodies[bodyIndex]
            body.__editing = ! body.__editing
            this.tagBodies.splice(bodyIndex, 1, body)
        },
    }
}
