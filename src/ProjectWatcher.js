import chokidar from 'chokidar';
import { copyPackage } from './helpers';

export default class ProjectWatcher {
  constructor(rootPath, dependenciesProjects) {
    this.print = true;
    this.rootPath = rootPath;
    this.dependenciesProjects = dependenciesProjects;
  }

  watch() {
    if (this.watcher) {
      console.warn('Already watching');
      return this;
    }
    if (this.print) console.log(`=> Watching dependencies for ${this.rootPath}`);
    this.watcher = chokidar.watch(this.dependenciesProjects.map((depProject) => depProject.path));
    this.watcher.on('change', (path) => this.copy(this.getProject(path)));
    return this;
  }

  getProject(path) {
    return this.dependenciesProjects.find((project) => {
      return path.startsWith(project.path);
    });
  }

  copy(project) {
    if (this.print) console.log(`   - Copying ${project.name}@${project.version}`);
    copyPackage(project, this.rootPath);
  }

  unwatch() {
    if (!this.watcher) {
      return null;
    }
    this.watcher.close();
    this.watcher = null;
  }
}
