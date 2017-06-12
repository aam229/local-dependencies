// @flow
import LocalPackage from './LocalPackage';

/**
 * A node within the {@link LocalPackageDependencyTree}. Each node corresponds to a local
 * package and the node's children are its children
 * @param pack The package for this node
 * @param children The children for the package
 * @param depth The depth of the node
 */
export default class LocalPackageDependencyTreeNode<T: LocalPackage> {
  localPackage: T;
  children: Array<LocalPackageDependencyTreeNode<T>>;
  depth: number;

  constructor(
    localPackage: T,
    dependencies: Array<LocalPackageDependencyTreeNode<T>>,
    depth: number,
  ) {
    this.localPackage = localPackage;
    this.children = dependencies;
    this.depth = depth;
  }

  /**
   * Get the direct children of this node
   */
  getChildren(): Array<LocalPackageDependencyTreeNode<T>> {
    return this.children;
  }

  /**
   * Get the package corresponding to this node
   */
  getPackage(): T {
    return this.localPackage;
  }

  /**
   * Get the depth of the node
   * @returns {number}
   */
  getDepth(): number {
    return this.depth;
  }

  /**
   * Get an iterator to go over all children under this node
   */
  * iterator(): Iterable<LocalPackageDependencyTreeNode<T>> {
    for (let i = 0; i < this.children.length; i += 1) {
      yield* this.children[i].iterator();
      yield this.children[i];
    }
  }

}
