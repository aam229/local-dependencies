// @flow
import chokidar from 'chokidar';
import EventEmitter from 'events';

import LocalPackageConfig from './model/LocalPackageConfig';
import LocalPackageState from './model/LocalPackageState';
import {
  THROTTLE_TIMEOUT,
  NODE_MODULES,
} from './constants';

const WATCH_IGNORE_REGEX = new RegExp(`${NODE_MODULES}|[\\/\\\\]\\.`);

/**
 * Watch the files for the provided list of local packages
 */
export default class PackageWatcher extends EventEmitter {
  packages: Map<string, LocalPackageState>;

  constructor(packages: Array<LocalPackageConfig>) {
    super();
    this.packages = packages
      .filter(p => p.isWatchEnabled())
      .map(p => new LocalPackageState(p.toObject())
        .setWatchEnabled(true)
        .setReady(true),
      )
      .reduce((m, p) => m.set(p.getName(), p), new Map());

    const paths = Array.from(this.packages.values())
      .map(p => p.getPath());

    const watcher = chokidar.watch(paths, { ignored: WATCH_IGNORE_REGEX });
    watcher.on('ready', () => {
      const handler = path => this.throttleChange(this.findPackageByPath(path));
      watcher.on('change', handler);
      watcher.on('add', handler);
      watcher.on('unlink', handler);
    });
  }

  /**
   * Register a callback for the change event
   */
  registerOnChange(callback: (p: LocalPackageState) => void) {
    this.on('change', callback);
  }

  /**
   * Unregister a callback for the change event
   */
  unregisterOnChange(callback: (p: LocalPackageState) => void) {
    this.removeListener('change', callback);
  }

  /**
   * Throttle the event emitted for a specific project
   * @private
   * @param localPackage
   */
  throttleChange(localPackage: ?LocalPackageState): void {
    if (!localPackage || !localPackage.isWatchEnabled()) {
      return;
    }
    clearTimeout(localPackage.getTimeoutHandle());
    localPackage.setTimeoutHandle(setTimeout(() => {
      this.emit('change', localPackage);
    }, THROTTLE_TIMEOUT));
  }

  /**
   * Find the package that best matches the provided file path
   * @param filePath
   * @returns {*}
   */
  findPackageByPath(filePath: string): ?LocalPackageState {
    return Array.from(this.packages.values())
      .reduce((bestMatch, localPackage) => {
        if (!filePath.startsWith(localPackage.path)) {
          return bestMatch;
        }
        // Pick the package with the longest match
        if (!bestMatch || localPackage.getPath().length > bestMatch.getPath().length) {
          return localPackage;
        }
        return bestMatch;
      }, null);
  }
}
