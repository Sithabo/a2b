const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Manually construct file:// URL for Windows compatibility
const inputPath = path.join(__dirname, "global.css").replace(/\\/g, "/");
const inputUrl = "file:///" + inputPath;

module.exports = withNativeWind(config, { input: inputUrl });
