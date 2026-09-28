#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const os = require('os');

const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const isValidVersion = (version) => typeof version === 'string' && VERSION_PATTERN.test(version);

// Walks up from the project directory and returns the first "simplelocalize.cliVersion" found in package.json.
const findPinnedVersion = (startDir) => {
    let dir = path.resolve(startDir);
    while (true) {
        const packageJsonPath = path.join(dir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const cliVersion = packageJson.simplelocalize && packageJson.simplelocalize.cliVersion;
                if (cliVersion) {
                    return { version: String(cliVersion), source: packageJsonPath };
                }
            } catch (error) {
                // ignore unreadable package.json and keep looking
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return null;
        }
        dir = parent;
    }
};

const resolveCliVersion = (projectDir) => {
    const fromEnv = process.env.SIMPLELOCALIZE_CLI_VERSION;
    const resolved = fromEnv
        ? { version: fromEnv, source: 'SIMPLELOCALIZE_CLI_VERSION' }
        : findPinnedVersion(projectDir) || { version: require('./package.json').cliVersion, source: 'default' };

    if (!isValidVersion(resolved.version)) {
        throw new Error(`Invalid SimpleLocalize CLI version '${resolved.version}' (from ${resolved.source}), use a full version, e.g. 2.12.0`);
    }
    return resolved.version;
};

const getPlatformSuffix = () => {
    const arch = os.arch() === "arm64" ? "-arm64" : "";
    switch (os.platform()) {
        case "win32":
            return "windows.exe";
        case "darwin":
            return "mac" + arch;
        case "linux":
            return "linux" + arch;
        default:
            throw new Error(`Unsupported platform: ${os.platform()} ${os.arch()}, set SIMPLELOCALIZE_CLI_BINARY to a binary path or use the JAR`);
    }
};

const getCacheDir = () => {
    if (process.env.SIMPLELOCALIZE_CLI_CACHE_DIR) {
        return process.env.SIMPLELOCALIZE_CLI_CACHE_DIR;
    }
    if (os.platform() === 'win32' && process.env.LOCALAPPDATA) {
        return path.join(process.env.LOCALAPPDATA, 'simplelocalize', 'cli');
    }
    const xdgCache = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
    return path.join(xdgCache, 'simplelocalize', 'cli');
};

const getBinaryPath = (version) => {
    const fileName = 'simplelocalize-cli' + (os.platform() === 'win32' ? '.exe' : '');
    return path.join(getCacheDir(), version, fileName);
};

async function installBinary(version, binaryPath) {
    const downloadUrl = `https://get.simplelocalize.io/binaries/${version}/simplelocalize-cli-${getPlatformSuffix()}`;
    console.error(`Downloading SimpleLocalize CLI ${version} from ${downloadUrl}...`);
    fs.mkdirSync(path.dirname(binaryPath), { recursive: true });

    // Download to a temporary file and rename, so parallel runs never see a partial binary
    const tempPath = `${binaryPath}.${process.pid}.tmp`;
    try {
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
            response.data.on('error', reject);
        });
        if (os.platform() !== 'win32') {
            fs.chmodSync(tempPath, 0o755);
        }
        fs.renameSync(tempPath, binaryPath);
    } catch (error) {
        fs.rmSync(tempPath, { force: true });
        try {
            fs.rmdirSync(path.dirname(binaryPath));
        } catch (ignored) {
            // not empty, another run already installed this version
        }
        const status = error.response && error.response.status;
        const reason = status === 404 ? `version ${version} not found` : error.message;
        throw new Error(`Error downloading SimpleLocalize CLI binary: ${reason}`);
    }
}

const ensureBinary = async (projectDir) => {
    if (process.env.SIMPLELOCALIZE_CLI_BINARY) {
        return process.env.SIMPLELOCALIZE_CLI_BINARY;
    }
    const version = resolveCliVersion(projectDir);
    const binaryPath = getBinaryPath(version);
    if (!fs.existsSync(binaryPath)) {
        await installBinary(version, binaryPath);
    }
    return binaryPath;
};

const run = async () => {
    let binaryPath;
    try {
        binaryPath = await ensureBinary(process.cwd());
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    const result = spawnSync(binaryPath, process.argv.slice(2), { stdio: 'inherit' });
    if (result.error) {
        console.error(`Error running SimpleLocalize CLI (${binaryPath}): ${result.error.message}`);
        process.exit(1);
    }
    if (result.signal) {
        process.kill(process.pid, result.signal);
    }
    process.exit(result.status ?? 1);
};

// Optional prefetch during installation; never fails the install (the binary is downloaded on first run anyway)
const prefetch = async () => {
    try {
        await ensureBinary(process.env.INIT_CWD || process.cwd());
    } catch (error) {
        console.warn(`${error.message}. SimpleLocalize CLI will be downloaded on first run.`);
    }
};

if (process.argv[2] === 'install' && process.env.npm_lifecycle_event === 'postinstall') {
    prefetch();
} else {
    run();
}
