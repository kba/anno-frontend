const AnnoClient = require('../anno-client')
module.exports = {
    props: {
        l10n:                {type: Object, required: true},
        purl:                {type: String, required: true},
        annotations:  {type: Array, required: true},
        initialSortedBy:     {type: String, default: 'date'},
        initialAllCollapsed: {type: Boolean, default: false},
    },
    data() { return {
        // annotations: this.initialAnnotations,
        options: {},
        sortedBy: this.initialSortedBy,
        allCollapsed: this.initialAllCollapsed
    }},
    template: require('./anno-list.html'),
    // style: require('./anno-list.css'),
    components: {
        'anno-viewer':    require('./anno-viewer'),
        'bootstrap-tabs': require('./bootstrap-tabs'),
        'bootstrap-tab':  require('./bootstrap-tab'),
    },
    mounted() {
        this.sort(this.initialSortedBy)
    },
    methods: {
        collapseAll(state) {
            this.$children.forEach(annoViewer => annoViewer.collapse(state))
            this.allCollapsed = ! this.allCollapsed
        },
        sort(newSortedBy) {
            console.log("before sort", this.annotations.map(anno => anno.id))
            if (newSortedBy) this.sortedBy = newSortedBy
            if (this.sortedBy == 'datereverse') this.sortByDateReverse()
            else if (this.sortedBy == 'date') this.sortByDate()
            else if (this.sortedBy == 'title') this.sortByTitle()
            else console.error("Unknown sorter", this.sortedBy)
            // console.log("after sort", this.annotations.map(anno => anno.id))
            // console.log("after sort", this.initialAnnotations.map(anno => anno.id))
            // console.log(this)
            // this.root.$vm.forceRender()
        },
        sortByDate()        { this.annotations.sort((a,b) => a.modified < b.modified ? -1 : a.modified === b.modified ? 0 : 1) },
        sortByDateReverse() { this.annotations.sort((a,b) => a.modified < b.modified ? +1 : a.modified === b.modified ? 0 : -1) },
        sortByTitle()       { this.annotations.sort((a,b) => a.title < b.title ? -1 : a.title === b.title ? 0 : 1) }
    },
}

