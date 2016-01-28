import path from 'path';
import child_process from 'child_process';

import { NODE_MODULES, GIT } from './constants';
import { isDirectory, copyPackage } from './helpers';

export default class ProjectInstaller {
  constructor(projects) {
    this.print = true;
    this.projects = projects.reduce((projectsMap, project) => {
      projectsMap.set(project.name, {
        ...project,
        invalid: true
      });
      return projectsMap;
    }, new Map());
    Array.from(this.projects.values()).forEach((project) => {
      project.projectsDependencies = project.projectsDependencies.map((projectDep) => {
        return this.projects.get(projectDep.name);
      })
    })
  }

  install(npm = false, hoist = false) {
    this.print && console.log('=> Installing projects');
    const projects = Array.from(this.projects.values());
    while (projects.length > 0) {
      const index = projects.findIndex((proj) => {
        return ! proj.projectsDependencies.find((projectDep) => projectDep.invalid);
      });
      if (index === -1) {
        throw new Error('Could not find any project ready to install, maybe you have circular dependencies?')
      }
      const project = projects[index];
      this.print && console.log(`   => Installing ${project.path}`);

      // TODO: Hoist project dependencies recursively
      project.projectsDependencies.forEach((projectDep) => {
        this.copyProject(projectDep, project);
      });
      // NPM install the project here
      this.npmInstall(project);

      projects.splice(index, 1);
      project.invalid = false;
    }
  }

  npmInstall(project) {
    const missingDependency = !! Object.keys(project.dependencies)
      .find((depName) => {
        return !isDirectory(path.join(project.path, NODE_MODULES, depName))
      });

    if (missingDependency === false){
      return;
    }
    this.print && console.log(`      - NPM install ${project.name}`);
    child_process.execSync('npm install', {
      cwd: project.path
    });
  }

  copyProject(sourceProject, destProject) {
    this.print && console.log(`      - Copying ${sourceProject.path}`);
    copyPackage(sourceProject, destProject.path)
  }
}