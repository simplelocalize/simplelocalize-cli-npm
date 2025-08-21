# SimpleLocalize CLI via npm

The main goal of this project is to give fronted developers
an easier way to use [SimpleLocalize CLI](https://github.com/simplelocalize/simplelocalize-cli)
in their workflows. 

## Installation

```shell
npm install @simplelocalize/cli
```

After installing the package, it should automatically choose the right binary for 
your system and install it into `node_modules/.bin` directory, to make it available for your
scripts in `package.json`.

```json
{
  "name": "My project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@simplelocalize/cli": "^2.10.0",
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


## NPX Support

You can also use `npx` to run SimpleLocalize CLI commands without installing the package
globally:

```shell
npx @simplelocalize/cli download
```

## Versioning explanation

`@simplelocalize/cli` versioning is synced with https://github.com/simplelocalize/simplelocalize-cli versioning.

`@simplelocalize/cli@2.9.1` will install SimpleLocalize CLI 2.9.x and this npm package version is 1.
`@simplelocalize/cli@2.9.2` will install SimpleLocalize CLI 2.9.x and this npm package version is 2.

By using this versioning scheme, we can release new versions of this npm package
without changing the SimpleLocalize CLI version, for example, to fix bugs in this package,
and follow semantic versioning rules.
