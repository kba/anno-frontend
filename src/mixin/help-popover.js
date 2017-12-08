const $ = require('jquery')
module.exports = {
  mounted() {
    Array.from(this.$el.querySelectorAll('[data-help-topic]')).map(helpPopover => {
      const url = this.$store.state.helpUrlTemplate
        .replace('{{ language }}', this.$store.state.language)
        .replace('{{ topic }}', helpPopover.dataset.helpTopic)
      $(helpPopover).popover({
        html: true,
        // container: 'body',
        placement: 'bottom',
        content() {
          fetch(url)
            .then(resp => resp.text())
            .then(data => {
              $(`#help-popover-content`).html(data)
              let popover = $(`#help-popover-content`).parent().parent()[0]
              let left = popover.style.left
              left = parseInt(left.substr(0, left.length -2))
              popover.style.left = (left - 48) + 'px'
            })
            .catch(err => console.log(err))
          return '<div id="help-popover-content">Loading ...</div>'
        }
      })
    })
  }
}
