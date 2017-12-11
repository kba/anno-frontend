module.exports = {

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  computed: {
    url() {
      return this.helpUrlTemplate
        .replace('{{ language }}', this.language)
        .replace('{{ topic }}', this.topic)
    },
    divClasses() {
      return {
        'panel': true,
        'panel-info': true,
        'slide-out': ! this.visible,
        'slide-in': this.visible,
      }
    },
    btnClasses() {
      return {
        'btn': true,
        'btn-info': true,
        'help-button': true,
        [`btn-${this.size}`]: true
      }
    },
  },

  data() {return {
    visible: false,
    content: null,
  }},

  props: {
    language:        {type: String, required: false, default: 'de'},
    topic:           {type: String, required: true},
    helpUrlTemplate: {type: String, required: true},
    size:            {type: String, required: false, default: 'xs'},
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
      if (window.helpPopoverModal)
        window.helpPopoverModal.dismiss()
      if (!this.visible) {
        this.fetchContent()
          .then(() => {
            content.innerHTML = this.content
          })
          .catch(err => {
            content.innerHTML = "loading failed :'("
          })
        window.helpPopoverModal = this
        const modal = document.querySelector(".modal-dialog")
        if (modal && modal.getClientRects()[0]) {
          const xOffset = modal.getClientRects()[0].x
          this.$el.querySelector('.panel').style.marginLeft = `-${xOffset}px`
        }
      } else {
        this.dismiss()
      }
      this.visible = ! this.visible
    }

  },

}
