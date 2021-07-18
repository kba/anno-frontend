module.exports = {

  template: require('./debug.html'),
  style: require('./debug.scss'),

  props: {
    annot:      { type: [Object, Boolean], default: false },
  },

  data() {
    return {
      annotJsonRedumped: 0,
    };
  },

  methods: {

    redumpAnnotJson() {
      this.annotJsonRedumped = Date.now();
    },

    importAnnotJson() {
      const inputJson = this.$refs.annotJsonTxa.value;
      function upd(state) {
        try {
          state.editing = JSON.parse(inputJson);
          window.alert('Imported.');
        } catch (err) {
          err.inputJson = inputJson;
          console.error('Error while trying to import JSON:', err);
          window.alert('Error while trying to import JSON:\n' + err);
        }
      }
      this.$store.commit('INJECTED_MUTATION', [upd]);
    },

  },

};
