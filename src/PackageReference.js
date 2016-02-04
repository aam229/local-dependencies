export default class PackageReference {
  constructor(data) {
    this.reset(data);
  }

  reset({ name, version }) {
    this.name = name;
    this.version = version;
  }

  getName() {
    return this.name;
  }

  getVersion() {
    return this.version;
  }

  toString() {
    return `${this.getName()}@${this.getVersion()}`;
  }
}
