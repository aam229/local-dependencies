import path from 'path';
import fs from 'fs';
import Project from './Project';
import ProjectConfig from './ProjectConfig';
import { CONFIG } from './constants';

export default class ProjectConfigReader {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  parse() {
    const configPath = path.join(this.projectPath, CONFIG);
    const configContent = fs.readFileSync(configPath, { encoding: 'utf-8' });
    const config = JSON.parse(configContent);
    const project = Project.create(this.projectPath);

    const dependencies = Object.keys(config).map((dependencyName) => {
      const dependencyConfig = config[dependencyName];
      const dependencyProject = Project.create(dependencyConfig.path);
      return dependencyProject.setWatch(dependencyConfig.watch);
    });
    return new ProjectConfig(project, dependencies);
  }
}
