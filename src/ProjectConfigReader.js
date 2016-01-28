import {  } from './helpers';

export default class ProjectConfigReader {
  parse(projectPath) {
    let configContent;
    const configPath = path.join(projectPath, CONFIG);
    try {
      configContent = fs.readFileSync(configPath, { encoding: 'utf-8' });
    } catch (error) {
      throw new Error(`Could not find the local dependencies config file at ${configPath}`);
    }

    try {
      const config = JSON.parse(configContent);
      const dependenciesPaths = config.dependencies.map((dependency) => dependency.path);
      const test = config.dependencies.map((dependency) => dependency.path);
      this.setProjectRoot(projectPath);
      this.setDependencies(dependenciesPath);
      this.setDependenciesWatches(dependenciesWatch);
    } catch (error) {
      throw new Error(`Cound not parse the local dependencies config file at ${configPath}`);
    }
    return this;
  }
}