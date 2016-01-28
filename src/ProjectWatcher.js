import chokidar from 'chokidar';
import { copyPackage } from './helpers'

export default class ProjectWatcher {
  constructor(srcProject, destPackagePath) {
    this.print = true;
    this.srcProject = srcProject;
    this.destPackagePath = destPackagePath;
  }

  watch(){
    this.copy();
    this.print && console.log(`=> Watching ${this.srcProject.path}`);
    this.watcher = chokidar.watch(this.srcProject.path);
    this.watcher.on('change', () => this.copy());
  }

  copy(){
    this.print && console.log(`=> Copying ${this.srcProject.path}`);
    copyPackage(this.srcProject, this.destPackagePath);
  }

  unwatch(){
    if (!this.watcher){
      return null;
    }
    this.watcher.close();
    this.watcher = null;
  }
}