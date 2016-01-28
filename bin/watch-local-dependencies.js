const path = require('path');
const fs = require('fs');
const LocalDependencies = require('../lib/').default;

const CONFIG_FILE = '.ldrc';

var configContent, config;
const configPath = path.join(process.cwd(), CONFIG_FILE);

try {
  configContent = fs.readFileSync(configPath, { encoding: "utf-8" });
} catch (error) {
  throw new Error('Could not find the local dependencies config file at ' + configPath);
}

try {
  config = JSON.parse(configContent);
} catch (error) {
  throw new Error("Cound not parse the local dependencies config file at " + configPath);
}

config.root = process.cwd();

new LocalDependencies(config);
