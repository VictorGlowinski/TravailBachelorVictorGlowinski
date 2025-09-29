// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration pour éviter les problèmes de cache
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ajouter cette ligne pour forcer le reset du cache
config.resetCache = true;

module.exports = config;