import { CONFIG } from './constants';
import fs from 'fs-extra';
import path from 'path';

export default class ProjectConfigWriter {
  setProject(project) {
    this.project = project;
    return this;
  }

  getProject() {
    return this.project;
  }

  setDependencies(dependencies) {
    this.dependencies = dependencies;
    return this;
  }

  getDependencies() {
    return this.dependencies;
  }

  setDependenciesWatches(dependencyNames) {
    this.dependencies.forEach((dependencyProject) => {
      if (dependencyNames.find((dependencyName) => dependencyName === dependencyProject.getName())) {
        dependencyProject.setWatch(true);
      }
    });
    return this;
  }

  write() {
    const config = this.dependencies.reduce((conf, dependencyProject) => {
      conf[dependencyProject.getName()] = {
        path: dependencyProject.getPath(),
        watch: dependencyProject.getWatch()
      };
      return conf;
    }, {});
    const configPath = path.join(this.project.path, CONFIG);
    const configTxt = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configTxt, 'utf8');
  }
}
