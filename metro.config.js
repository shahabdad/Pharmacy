const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Tell expo-router where the app directory lives (default is ./app, ours is ./src/app)
process.env.EXPO_ROUTER_APP_ROOT = path.join(__dirname, 'src/app');

module.exports = withNativeWind(config, { input: './global.css' });
