# Info

Deletes all packages in a artifactory repo that are older than a given date

# Requirements

The following environment variables should exist

* ARTFC_USER
* ARTFC_PASSWORD

# Usage

Install dependencies via npm or yarn

```
$ npm install
```

Run script with repo and date (YYYY-MM-dd) given as params like so:

```
$ node main.js sidecar-ci 2017-01-01
```

The script will then list the files to be deleted and prompt you whether you
would like to proceed or not.

Please note that by default this script uses nyc-artfc-p01.jcrew.com as its
default artifactory target. This can be changed at the top of the `main.js`
file.

Also, `query.aql` file isn't actually used and the executed AQL should be edited
in the source code of `main.js`
