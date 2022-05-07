'use strict';

function annoIdToPermaUrl(id) {
  /*
    The "perma" here is meant to be the canonical URL that people can
    bookmark and share. Ideally it should tend to be short and also be
    somewhat permanent, even if less strictly than a DOI would be.
  */
  const { state } = this.$store;
  let url = state.purlTemplate;
  if (!url) { return '#!missingConfig:purlTemplate!' + id; }
  const slug = id.split('/').slice(-1)[0];

  url = url.replace('%sl', slug);
  url = url.replace('{{ slug }}', slug); // deprecated! will be dropped soon.
  url = url.replace('%ep', state.annoEndpoint);

  return url;
}

module.exports = {
  methods: {
    annoIdToPermaUrl,
  },
};
