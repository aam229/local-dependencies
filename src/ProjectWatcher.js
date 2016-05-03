import chokidar from 'chokidar';
import EventEmitter from 'events';

import { THROTTLE_TIMEOUT, NODE_MODULES } from './constants';

export default class ProjectWatcher extends EventEmitter {
  constructor(projects) {
    super();
    this.projects = projects.filter((project) => project.getWatch());
    this.timeouts = new Map();
    this.mutedProjects = new Map();
  }

  watch() {
    if (this.watcher) {
      return this;
    }
    // Ignore node_modules and any hidden file
    const ignoreRegex = new RegExp(`${NODE_MODULES}|[\\\/\\\\]\\\.`);

    this.watcher = chokidar.watch(this.projects.map((project) => project.getPath()), {
      ignored: ignoreRegex
    });
    this.watcher.on('ready', () => this.register());
    return this;
  }

  unmuteProject(project) {
    if (!project.getWatch() || !this.mutedProjects.get(project)) {
      return;
    }
    this.mutedProjects.set(project, false);
  }

  muteProject(project) {
    this.mutedProjects.set(project, true);
  }

  register() {
    const handler = (path) => this.throttleChange(this.getProject(path), path);
    this.watcher.on('change', handler);
    this.watcher.on('add', handler);
    this.watcher.on('unlink', handler);
  }

  throttleChange(project, path) {
    if (this.mutedProjects.get(project)) {
      return;
    }
    clearTimeout(this.timeouts.get(project));
    this.timeouts.set(project, setTimeout(() => {
      this.emit('change', project, path);
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
