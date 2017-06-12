// @flow

import LocalPackage from './LocalPackage';
import PackageReference from './PackageReference';
import LocalPackageDependencyTreeNode from './LocalPackageDependencyTreeNode';
/**
 * This data structure stores the children (available locally)
 * of packages. Each node is a local package and its children are
 * children of that package which are available locally.
 */
export default class LocalPackageDependencyTree<T: LocalPackage> {
  root: LocalPackageDependencyTreeNode<T>;

  constructor(root: LocalPackageDependencyTreeNode<T>) {
    this.root = root;
  }

  /**
   * Get an iterator to go over each node in the tree
   * @param {boolean} includeRoot If set to false, the root node is not part of the iterator
   */
  * iterator(includeRoot: boolean = true): Iterable<LocalPackageDependencyTreeNode<T>> {
    yield* this.root.iterator();
    if (includeRoot) {
      yield this.root;
    }
  }

  /**
   * Build a dependency tree from a root package and a list of local packages available locally.
   */
  static create(rootPackage: T, localPackages: Array<T>): LocalPackageDependencyTree<T> {
    const packagesByName: Map<string, T> = localPackages
      .reduce((m, p) => m.set(p.getName(), p), new Map());

    const rootNode = LocalPackageDependencyTree.createNodes(
      rootPackage,
      packagesByName,
      [],
      0,
      true,
    );
    return new LocalPackageDependencyTree(rootNode);
  }

  /**
   * Create all the tree nodes recursively
   * @private
   */
  static createNodes(
    currentPackage: T,
    localPackages: Map<string, T>,
    parentPackages: Array<T>,
    depth: number,
    includeDevDependencies: boolean = false,
  ): LocalPackageDependencyTreeNode<T> {
    if (parentPackages.indexOf(currentPackage) !== -1) {
      throw new Error(`There is a cyclic dependency on ${currentPackage.getName()}`);
    }
    parentPackages.push(currentPackage);
    const dependencies: Array<LocalPackageDependencyTreeNode<T>> = currentPackage
      .getDependencies(includeDevDependencies)
      // $FlowFixMe: Flow does not handle the Array.filter logic
      .map((dependencyRef: PackageReference) => localPackages.get(dependencyRef.getName()))
      .filter((dependency: ?T) => !!dependency)
      .map((dependency: T) => LocalPackageDependencyTree.createNodes(
        dependency,
        localPackages,
        parentPackages,
        depth + 1,
      ));
    parentPackages.pop();
    return new LocalPackageDependencyTreeNode(currentPackage, dependencies, depth);
  }
}
