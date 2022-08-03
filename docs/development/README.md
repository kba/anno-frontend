
Development
===========

Setup
-----

1.  Install nodejs v12 and npm v7.
1.  Clone the repo.
1.  Inside the local repo directory, install the dependencies:
    `npm install .`
1.  Build both development and production version: `npm run build`
    * To see other useful scripts: `npm run`
    * Building the development version will remove any outdated companion
      production version.
1.  Host the repo directory on a local webspace.
    * Consider protecting that webspace based on your security policies.
    * On Ubuntu, one easy way to setup a temporary webserver for this repo
      is to use python's webserver module. Refer to the `pyhttpd` entry of
      `npm run` for an example command line.
1.  Try some of the HTML examples mentioned in the repo's main readme,
    by navigating your browser to the URL of that file on your webspace.





