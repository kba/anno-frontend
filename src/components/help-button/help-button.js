const $ = require('jquery')

module.exports = {

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  data() {return {
    classes: {
      'btn': true,
      'btn-info': true,
      'help-button': true,
      [`btn-${this.size}`]: true,
    }
  }},

  props: {
    language:        {type: String, required: false, default: 'de'},
    topic:           {type: String, required: true},
    helpUrlTemplate: {type: String, required: true},
    size:            {type: String, required: false, default: 'xs'},
  },

  mounted() {

    const url = this.helpUrlTemplate
      .replace('{{ language }}', this.language)
      .replace('{{ topic }}', this.topic)

    $(this.$el).popover({
      html: true,
      title: '',
      placement: 'bottom',
      content: () => {
        fetch(url)
        .then(resp => resp.text())
        .then(data => {
          const content = $(`#help-popover-${this.topic}`)
          const container = content.parent().parent()[0]
          let left = container.style.left
          left = parseInt(left.substr(0, left.length -2))
          container.style.left = (left - 48) + 'px'
          if ($.fn.resizable) $(container).resizable()
          content[0].innerHTML = data
        })
        .catch(err => console.log(err))
        return `<div id="help-popover-${this.topic}">Loading ...</div>`
      }
    })

  }
}
