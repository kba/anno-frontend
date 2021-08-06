'use strict';

window.annotations = [
  {
    id: 'https://anno.ub.uni-heidelberg.de/123',
    creator: 'john',
    title: 'Anno mit Anwo 1',
    body: [
      { type: 'TextualBody', format: 'text/html', value: 'Some <strong>bold</strong> statements here.' },
      { type: 'TextualBody', motivation: 'tagging', value: '#nuffsaid' },
      { motivation: 'linking', label: 'Metavariables', id: 'http://gnd.info/12345' },
    ],
    target: 'http://foo.bar',
    created:  '2017-03-01T10:00:00Z',
    modified: '2017-03-22T22:05:00Z',
    hasVersion: [
      { title: 'Tset anontatio',
        id: 'https://anno.ub.uni-heidelberg.de/123-rev1',
        created:  '2017-03-01T10:00:00Z',
        modified: '2017-03-01T10:05:00Z',
        doi: '10.1234/123~1',
      },
      { title: 'Tset annotatio (fixed typo)',
        id: 'https://anno.ub.uni-heidelberg.de/123-rev2',
        created:  '2017-03-01T11:00:00Z',
        modified: '2017-03-11T11:05:00Z',
        doi: '10.1234/123~2',
      },
      { title: 'Test annotation (fixed 2nd typo)',
        id: 'https://anno.ub.uni-heidelberg.de/123-rev3',
        created:  '2017-03-22T22:00:00Z',
        modified: '2017-03-22T22:05:00Z',
        doi: '10.1234/123~3',
      },
    ],
    hasReply: [
      {
        id: 'https://anno.ub.uni-heidelberg.de/456',
        creator: 'mike',
        title: 'Disagreement',
        body: { type: 'TextualBody', format: 'text/html', value: 'Too strong, actually' },
        target: { id: 'https://anno.ub.uni-heidelberg.de/123' },
      },
    ],
    doi: '10.11234/123',
  },

  {
    '@context': 'http://anno.ub.uni-heidelberg.de/context.jsonld',
    body: [
      {
        format: 'text/html',
        id: 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?id=802168b6-873f-4194-88b2-8e6a29a1493b&body=1&rev=1',
        type: 'TextualBody',
        value: '',
      },
      {
        predicate: '',
        purpose: 'linking',
        source: 'http://mit.titel.test/',
        value: 'Mit Titel',
      },
      {
        predicate: '',
        purpose: 'linking',
        source: 'http://ohne.titel.test/',
      },
    ],
    title: 'Links mit und ohne Titel',
    created: '2017-03-31 11:22:27',
    creator: 'kba',
    hasVersion: [
      {
        id: 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?id=802168b6-873f-4194-88b2-8e6a29a1493b&rev=1',
        modified: '2017-03-31 11:22:27',
      },
    ],
    id: 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?id=802168b6-873f-4194-88b2-8e6a29a1493b&rev=1',
    target: [
      {
        id: 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?id=802168b6-873f-4194-88b2-8e6a29a1493b&target=1&rev=1',
        selector: {
          type: 'SvgSelector',
          value: '<svg xmlns="http://www.w3.org/2000/svg"> <rect x="0" y="0" width="200" height="200"/> <rect x="200" y="200" width="200" height="200"/> <rect x="400" y="400" width="200" height="200"/> <rect x="600" y="600" width="200" height="200"/> <rect x="800" y="800" width="200" height="200"/> <rect x="800" y="1000" width="224" height="24"/> </svg>',
        },
        source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/1024px-Ghostscript_Tiger.svg.png',
      },
    ],
  },

  {
    id: 'http://bla/tags-anno',
    title: 'Tagging and svg test',
    body: [
      { motivation: 'tagging', value: 'tag0' },
      { motivation: 'tagging', value: 'tag1' },
      { motivation: 'tagging', value: 'tag2' },
      { motivation: 'tagging', value: 'tag3' },
      { motivation: 'tagging', value: 'tag4' },
      { motivation: 'tagging', value: 'tag5' },
    ],
    target: [
      {
        source: 'http://foo',
        selector: {
          type: 'SvgSelector',
          value: `<svg xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="200" height="200"/>
              <rect x="200" y="200" width="200" height="200"/>
              <rect x="400" y="400" width="200" height="200"/>
              <rect x="600" y="600" width="200" height="200"/>
              <rect x="800" y="800" width="200" height="200"/>
              <rect x="800" y="1000" width="224" height="24"/>
            </svg>`,
        },
      },
    ],
  },

  {
    id: 'urn:uuid:61d7018a-8582-4c4c-9704-74e5ac3340f0',
    creator: 'john',
    title: 'Anno mit Anwo 2',
    body: [
      {
        type: 'TextualBody',
        format: 'text/html',
        value: 'Some <strong>bold</strong> statements here.',
      },
      {
        type: 'TextualBody',
        motivation: 'tagging',
        value: '#nuffsaid',
      },
      {
        motivation: 'linking',
        label: 'Metavariables',
        id: 'http://gnd.info/12345',
      },
    ],
    target: { source: 'http://foo.bar' },
    modified: '2017-03-22 22:00:00',
    hasVersion: [
      {
        id: 'https://anno.ub.uni-heidelberg.de/123-rev1',
        title: 'Tset anontatio',
        modified: '2017-03-01 10:00:00',
      },
      {
        title: 'Tset annotatio',
        id: 'https://anno.ub.uni-heidelberg.de/123-rev2',
        modified: '2017-03-11 11:00:00',
      },
      {
        title: 'Test annotation',
        id: 'https://anno.ub.uni-heidelberg.de/123-rev3',
        modified: '2017-03-22 22:00:00',
      },
    ],
    hasReply: [
      {
        id: 'https://anno.ub.uni-heidelberg.de/456',
        creator: 'mike',
        title: 'Disagreement',
        body: {
          type: 'TextualBody',
          format: 'text/html',
          value: 'Too strong, actually',
        },
        target: {
          id: 'https://anno.ub.uni-heidelberg.de/123',
        },
      },
    ],
  },
  {
    body: [],
    target: [
      {
        selector: {
          type: 'SvgSelector',
          value:
`<svg xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="200" height="200"/>
<rect x="200" y="200" width="200" height="200"/>
<rect x="400" y="400" width="200" height="200"/>
<rect x="600" y="600" width="200" height="200"/>
<rect x="800" y="800" width="200" height="200"/>
<rect x="800" y="1000" width="224" height="24"/>
</svg>`,
        },
      },
    ],
  },

  { id: 'https://anno.ub.uni-heidelberg.de/fragmentAnno1',
    title: 'zu Fragment 1 (Test)',
    body: { format: 'text/html', type: 'TextualBody', value: '1' },
    collection: 'default',
    created: '2021-08-06T21:46:49.036Z',
    modified: '2021-08-06T21:46:49.036Z',
    rights: 'https://creativecommons.org/licenses/by/4.0/',
    target: {
      selector: [
        {
          type: 'FragmentSelector',
          value: 'frag-ex1',
        },
      ],
      source: 'http://anno.test/displayAnnotations',
    },
    type: ['Annotation'],
  },

  { id: 'https://anno.ub.uni-heidelberg.de/fragmentAnno2a',
    title: 'zu Fragment 2 (noch)',
    body: { format: 'text/html', type: 'TextualBody', value: '2a' },
    collection: 'default',
    created: '2021-08-06T21:46:49.036Z',
    modified: '2021-08-06T21:46:49.036Z',
    rights: 'https://creativecommons.org/licenses/by/4.0/',
    target: {
      selector: [
        {
          type: 'FragmentSelector',
          value: 'frag-ex2',
        },
      ],
      source: 'http://anno.test/displayAnnotations',
    },
    type: ['Annotation'],
  },

  { id: 'https://anno.ub.uni-heidelberg.de/fragmentAnno2b',
    title: 'zu Fragment 2 (doch)',
    body: { format: 'text/html', type: 'TextualBody', value: '2b' },
    collection: 'default',
    created: '2021-08-06T21:46:49.036Z',
    modified: '2021-08-06T21:46:49.036Z',
    rights: 'https://creativecommons.org/licenses/by/4.0/',
    target: {
      selector: [
        {
          type: 'FragmentSelector',
          value: 'frag-ex2',
        },
      ],
      source: 'http://anno.test/displayAnnotations',
    },
    type: ['Annotation'],
  },

  { id: 'https://anno.ub.uni-heidelberg.de/fragmentAnno3',
    title: 'zu Fragment 3 (Dinge)',
    body: { format: 'text/html', type: 'TextualBody', value: '3' },
    collection: 'default',
    created: '2021-08-06T21:46:49.036Z',
    modified: '2021-08-06T21:46:49.036Z',
    rights: 'https://creativecommons.org/licenses/by/4.0/',
    target: {
      selector: [
        {
          type: 'FragmentSelector',
          value: 'frag-ex3',
        },
      ],
      source: 'http://anno.test/displayAnnotations',
    },
    type: ['Annotation'],
  },

];
