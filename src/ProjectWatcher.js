import chokidar from 'chokidar';
import EventEmitter from 'events';

export default class ProjectWatcher extends EventEmitter {
  constructor(projects) {
    super();
    this.projects = projects;
  }

  watch() {
    if (this.watcher) {
      return this;
    }
    this.watcher = chokidar.watch(this.projects.map((depProject) => depProject.path));
    this.watcher.on('change', (path) => this.emit('change', this.getProject(path)));
    return this;
  }

  getProject(path) {
    return this.projects.reduce((bestMatch, project) => {
      if (!path.startsWith(project.path)) {
        return bestMatch;
      }
      // Handle cases where two module are in the same directory and have
      // the same prefix.
      if (!bestMatch || project.getPath().length > bestMatch.getPath().length) {
        return project;
      }
      return bestMatch;
    }, null);
  }

  unwatch() {
    if (!this.watcher) {
      return null;
    }
    this.watcher.close();
    this.watcher = null;
  }
}
