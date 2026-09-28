# SimpleLocalize CLI via npm

The main goal of this project is to give fronted developers
an easier way to use [SimpleLocalize CLI](https://github.com/simplelocalize/simplelocalize-cli)
in their workflows. 

## Installation

```shell
npm install @simplelocalize/cli
```

The package installs a small `simplelocalize` launcher into `node_modules/.bin`, so it's available for your
scripts in `package.json`. The launcher downloads the right SimpleLocalize CLI binary for your system
on first run (or during installation, when install scripts are allowed) and caches it per version.

```json
{
  "name": "My project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@simplelocalize/cli": "^3.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "sl:download": "simplelocalize download",
    "sl:upload": "simplelocalize upload",
    "sl:autotranslate": "simplelocalize auto-translate"
  },
  "simplelocalize": {
    "cliVersion": "2.12.0"
  }
}
```

Learn more about [SimpleLocalize CLI commands](https://github.com/simplelocalize/simplelocalize-cli)


## NPX Support

You can also use `npx` to run SimpleLocalize CLI commands without installing the package
globally:

```shell
npx @simplelocalize/cli download
```

## Choosing the CLI version

The npm package version is independent of the SimpleLocalize CLI version. The CLI version is resolved in this order:

1. `SIMPLELOCALIZE_CLI_VERSION` environment variable, e.g. `SIMPLELOCALIZE_CLI_VERSION=2.12.0 npx @simplelocalize/cli download`
2. `simplelocalize.cliVersion` in the nearest `package.json` that defines it (searched from the current directory upwards)
3. the default CLI version bundled with the installed package (`cliVersion` in its `package.json`)

Use a full version, e.g. `2.12.0`. See [CLI releases](https://github.com/simplelocalize/simplelocalize-cli/releases) for available versions.
We recommend pinning `simplelocalize.cliVersion` in your project, so every developer and CI run uses the same CLI.

Other environment variables:

- `SIMPLELOCALIZE_CLI_CACHE_DIR` – where binaries are cached (default: `~/.cache/simplelocalize/cli`, `%LOCALAPPDATA%\simplelocalize\cli` on Windows). Cache this directory in CI to skip downloads.
- `SIMPLELOCALIZE_CLI_BINARY` – path to an already installed CLI binary; skips the download entirely.

## Upgrading from 2.x

`@simplelocalize/cli@2.x` versions were tied to the CLI version (`2.10.x` installed CLI `2.10.0`).
Since `3.0.0`, pin the CLI version with `simplelocalize.cliVersion` instead. The launcher requires Node.js 18 or newer.
