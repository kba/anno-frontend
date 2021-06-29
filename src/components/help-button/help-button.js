function replaceTemplates(str, ctx) {
  return str.replace(/(?:[\(\{]{2})\s*([a-z]+)\s*(?:[\)\}]{2})/g, (_, name) => {
    return ctx[name]
  })
}

module.exports = {

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  computed: {
    url() {return replaceTemplates(this.helpUrlTemplate, this)},
    topicTitle() {return this.title ? this.title : this.topic},
    manualUrl() {return replaceTemplates(this.helpUrlManual, this)},
  },

  data() {return {
    visible: false,
    content: null,
  }},

  props: {
    language:        {type: String, required: false, default: 'de'},
    topic:           {type: String, required: true},
    title:           {type: String, required: false},
    triggerCls:      {type: String, default: ''},
    buttonLabel:     {type: String, default: ''},
    helpUrlTemplate: {type: String, required: true},
    helpUrlManual:   {type: String, required: false},
  },

  methods: {

    dismiss() {
      this.visible = false
      window.helpPopoverModal = null
    },

    fetchContent() {
      return new Promise((resolve, reject) => {
          if (this.content) {
            return resolve(this.content)
          } else {
            fetch(this.url)
              .then(resp => resp.text())
              .then(data => resolve(this.content = data))
              .catch(reject)
          }
      })
    },

    togglePopover() {
      const content = this.$el.querySelector('div.panel-body')
      if (!this.visible) {
        this.fetchContent()
          .then(() => {
            content.innerHTML = this.content
          })
          .catch(err => {
            content.innerHTML = "loading failed :'("
          })
        if (window.helpPopoverModal)
          window.helpPopoverModal.dismiss()
        window.helpPopoverModal = this
        const modal = document.querySelector(".modal-dialog")
        if (modal && modal.getClientRects()[0]) {
          const xOffset = modal.getClientRects()[0].x
          this.$el.querySelector('.panel').style.marginLeft = `-${xOffset}px`
        }
        this.visible = true
      } else {
        this.dismiss()
        this.visible = false
      }
    }

  },

}
