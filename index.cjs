#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const os = require('os');

const binaryPath = path.join(__dirname, 'bin', 'simplelocalize');

const isBinaryInstalled = () => {
    try {
        execSync(binaryPath + ' --version', { stdio: 'ignore' });
        return true;
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
    return `https://github.com/simplelocalize/simplelocalize-cli/releases/download/${version}/simplelocalize-cli-${platform}${arch}`
}

async function installBinary() {
    const cliVersion = "2.8.0";
    const downloadUrl = buildDownloadBinaryUrl(cliVersion);
    if (!fs.existsSync(path.join(__dirname, 'bin'))) {
        fs.mkdirSync(path.join(__dirname, 'bin'));
    }

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

    console.log('SimpleLocalize CLI downloaded successfully!');

    // Make it executable (only on Unix-based systems)
    if (os.platform() !== 'win32') {
        fs.chmodSync(binaryPath, 0o755);
    }

    console.log('Binary is now executable.');
}

const linkToNodeModulesBin = () => {
    const nodeModulesBinPath = path.join(__dirname, '..', '..', '.bin', 'simplelocalize');
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

init();
