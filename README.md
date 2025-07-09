# SimpleLocalize CLI via npm

The main goal of this project is to give fronted developers
an easier way to use [SimpleLocalize CLI](https://github.com/simplelocalize/simplelocalize-cli)
in their workflows. 

## Installation

```
npm install @simplelocalize/cli@2.9.1
```

After installing the package, it should automatically choose the right binary for 
your system and install it into `node_modules/.bin` directory, to make it available for your
scripts in `package.json`.

## Usage

Package SimpleLocalize CLI in your project and makes it available in `package.json` scripts.


```
{
  "name": "My project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@simplelocalize/cli": "^2.9.1",
  },
  "scripts": {
    "start": "react-scripts start",
    "sl:download": "simplelocalize download",
    "sl:upload": "simplelocalize upload",
    "sl:autotranslate": "simplelocalize auto-translate"
  },
}
```

Learn more about [SimpleLocalize CLI commands](https://github.com/simplelocalize/simplelocalize-cli)

## Versioning explanation

`@simplelocalize/cli` versioning is synced with https://github.com/simplelocalize/simplelocalize-cli versioning.

`@simplelocalize/cli@{CLI_VERSION}-release.{NPM_VERSION}` is the versioning scheme used in this package.
Where `CLI_VERSION` is the version of SimpleLocalize CLI and `NPM_VERSION` is the version of this npm package.

`@simplelocalize/cli@2.9.1` will install SimpleLocalize CLI 2.9.x and this npm package version is 1.
`@simplelocalize/cli@2.9.1` will install SimpleLocalize CLI 2.9.x and this npm package version is 2.

By using this versioning scheme, we can release new versions of this npm package
without changing the SimpleLocalize CLI version, for example, to fix bugs in this package.