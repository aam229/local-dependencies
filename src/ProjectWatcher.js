import chokidar from 'chokidar';
import EventEmitter from 'events';
import { THROTTLE_TIMEOUT, NODE_MODULES, GIT } from './constants';

export default class ProjectWatcher extends EventEmitter {
  constructor(projects) {
    super();
    this.projects = projects;
    this.timeouts = new Map();
    this.watches = new Map();
  }

  watch() {
    if (this.watcher) {
      return this;
    }
    this.watcher = chokidar.watch([], {
      ignored: new RegExp(`${NODE_MODULES}|${GIT}`)
    });
    this.projects.forEach((project) => this.watchProject(project));
    this.watcher.on('ready', () => this.register());
    return this;
  }

  watchProject(project) {
    if (!project.getWatch() || this.watches.has(project)) {
      return;
    }
    this.watcher.add(project.getPath());
    this.watches.set(project, true);
  }

  unwatchProject(project) {
    this.watcher.unwatch(project.getPath());
    this.watches.delete(project);
  }

  register() {
    const handler = (path) => this.throttleChange(this.getProject(path));
    this.watcher.on('change', handler);
    this.watcher.on('add', handler);
    this.watcher.on('unlink', handler);
  }

  throttleChange(project) {
    // Dirty hack to get around that unwatching is not always immediate
    // and can cause multiple events if the watched project is changed
    // immediately after 'change' is triggered
    if (!this.watches.has(project)) {
      return;
    }
    clearTimeout(this.timeouts.get(project));
    this.timeouts.set(project, setTimeout(() => {
      this.emit('change', project);
    }, THROTTLE_TIMEOUT));
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

  close() {
    if (!this.watcher) {
      return null;
    }
    this.watcher.close();
    this.watcher = null;
  }
}
