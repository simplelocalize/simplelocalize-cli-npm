# SimpleLocalize CLI via npm (work in progress)

The main goal of this project is to give fronted developers
an easier way to use [SimpleLocalize CLI](https://github.com/simplelocalize/simplelocalize-cli)
in their workflows. 

## Installation

```
npm install @simplelocalize/cli@2.9.0
```

After installing the package, it should automatically choose the right binary for 
your system and install it into `node_modules/.bin` directory, to make it available for your
scripts in `package.json`.

> The work on this package is in progress, and at time of writing this documentation, the plugin installs the newest version of the CLI, which is 2.8.0

## Usage

Package SimpleLocalize CLI in your project and makes it available in `package.json` scripts.


```
{
  "name": "My project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@simplelocalize/cli": "^2.9.0",
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

## Versioning

`@simplelocalize/cli` versioning is synced with https://github.com/simplelocalize/simplelocalize-cli versioning.
That means `@simplelocalize/cli@2.9.0` will install SimpleLocalize CLI 2.9.0.