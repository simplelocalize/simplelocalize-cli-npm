#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const os = require('os');

let binaryPath = path.join(__dirname, 'bin', 'simplelocalize');
if (os.platform() === 'win32') {
    binaryPath += '.exe';
}

const getExpectedCliVersion = () => {
    const packageVersion = require('./package.json').version;
    const parts = packageVersion.split('.');
    return parts[0] + '.' + parts[1] + '.0';
};

const isBinaryInstalled = () => {
    try {
        const output = execSync(binaryPath + ' --version').toString().trim();
        const expectedVersion = getExpectedCliVersion();
        return output.includes(expectedVersion);
    }
    catch (error) {
        return false;
    }
}

const printBinaryVersion = () => {
    try {
        console.log(execSync(binaryPath + ' --version').toString());
    }
    catch (error) {
        console.error('Error running SimpleLocalize CLI');
        process.exit(1);
    }
}

const buildDownloadBinaryUrl = (version) => {
    let platform = "";
    if (os.platform() === "win32") {
        platform = "windows.exe"
    }

    if (os.platform() === "darwin") {
        platform = "mac"
    }

    if (os.platform() === "linux") {
        platform = "linux"
    }

    let arch = "";
    if (os.arch() === "arm64") {
        arch = "-arm64"
    }
    console.log(`Downloading SimpleLocalize CLI ${version} for ${platform}${arch}...`);
    return `https://get.simplelocalize.io/binaries/${version}/simplelocalize-cli-${platform}${arch}`
}

async function installBinary() {
    const cliVersion = getExpectedCliVersion();
    if (fs.existsSync(binaryPath)) {
        console.log('Removing existing binary...');
        fs.unlinkSync(binaryPath);
    }
    const downloadUrl = buildDownloadBinaryUrl(cliVersion);
    if (!fs.existsSync(path.join(__dirname, 'bin'))) {
        fs.mkdirSync(path.join(__dirname, 'bin'));
    }

    try {
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(binaryPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading SimpleLocalize CLI binary:', error.message);
        process.exit(1);
    }

    // Make it executable (only on Unix-based systems)
    if (os.platform() !== 'win32') {
        console.log('Making binary executable...');
        fs.chmodSync(binaryPath, 0o755);
    }

    // Ensure binary exists and is executable before continuing
    if (!fs.existsSync(binaryPath)) {
        throw new Error('Binary file was not created!');
    }
}

const linkToNodeModulesBin = () => {
    let nodeModulesBinPath = path.join(__dirname, '..', '..', '.bin', 'simplelocalize');

    if (os.platform() === 'win32') {
        nodeModulesBinPath += '.exe';
    }

    // Ensure the .bin directory exists
    const binDir = path.dirname(nodeModulesBinPath);
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
    }

    if (fs.existsSync(nodeModulesBinPath)) {
        fs.unlinkSync(nodeModulesBinPath);
    }
    fs.symlinkSync(binaryPath, nodeModulesBinPath);
    console.log('Link to node_modules/.bin created.');
}

const init = async () => {
    console.log("Checking if SimpleLocalize CLI is installed...");
    if (!isBinaryInstalled()) {
        console.log("SimpleLocalize CLI not installed. Installing...");
        await installBinary();
        if (!isBinaryInstalled()) {
            console.error('Error installing SimpleLocalize CLI');
            process.exit(1);
        }
        console.log("SimpleLocalize CLI installed successfully!");
    } else {
        console.log("SimpleLocalize CLI already installed.");
    }
    printBinaryVersion();
    linkToNodeModulesBin();
    process.exit(0);
}

// Only run install logic if called with 'install' argument (for postinstall)
if (process.argv[2] === 'install') {
    (async () => {
        await init();
    })();
} else {
    // Forward all other CLI commands to the downloaded binary
    if (!isBinaryInstalled()) {
        console.error('SimpleLocalize CLI binary is not installed. Please run: npm install');
        process.exit(1);
    }
    // Build the command to forward
    const args = process.argv.slice(2).map(arg => {
        // Quote arguments with spaces for safety
        if (/\s/.test(arg)) return `"${arg}"`;
        return arg;
    }).join(' ');
    try {
        execSync(`${binaryPath} ${args}`, { stdio: 'inherit' });
        process.exit(0);
    } catch (error) {
        process.exit(error.status || 1);
    }
}
