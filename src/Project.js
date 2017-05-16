import Package from './Package';

export default class Project extends Package {
  static create(rootPath) {
    return new Project(Package.parse(rootPath));
  }

  constructor({ watch, ...packageConfig }) {
    super(packageConfig);
    this.watch = watch;
  }

  getWatch() {
    return this.watch;
  }

  setWatch(watch) {
    this.watch = watch;
    return this;
  }

  isPrepared() {
    return this.prepared;
  }

  setPrepared() {
    this.prepared = true;
    return this;
  }
}
