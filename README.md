# Local Dependencies

The `npm link` command is broken by design. While the root module is able to appropriately require linked module, there are issues:

 - Dependencies that are present in the root module and the linked module will resolve to different instances.
 - Peer dependencies in the linked module are not available.
 
> Another issue to keep in mind is that linked modules may rely on other linked module. This makes any implementation more complicated by requiring recursion.

## Linking

We can symlink all the dependencies of the linked module so that they resolve to the one in the root module. All peer dependencies must be symlinked as well as shared dev/prod dependencies. While this is not a bad solutions, it modifies all the dependencies of the linked module. It would not work if multiple projects with the same linked dependencies are running at the same time.
 
> It kind of kills it that projects with the same linked dependencies cannot run at the same time.

## Copying

We can copy all the dependencies that are present locally into the root module dependencies. It means watching all the local dependencies for changes and recopying them on change. While this is probably the best solution, it is more complex to implement and it requires some configuration.

> This to me, seems like the best solution

## Algorithm

1. Read the .dmrc file in the `rootModule` to get a list of paths in which to look for local modules.
2. Build a list named `localDependencies` of local modules in the provided paths
3. Create an empty `allDependencies` object. Keys are the module name and values are objects looking like `{ version: "x", path: "x", isLocal: true }` 
4. Starting at the `rootModule`:
    1. Look at the module's dependencies and match them against the `localDependencies`.
    2. If there are matches, go back to `1` for each of the matched modules.
    3. Add all matches to the `allDependencies` object.
    4. Go through all the installed dependency
        1. If the `allDependencies` object already contains an entry and the dependency`version is lower, continue.
        2. Add the `dependency` to the `localDependencies`
5. Copy all the paths from the `allDependencies` object into the `rootModules` dependencies
6. Watch the dependencies from the `allDependencies` that have `isLocal` set to true. Copy the content of the on change.

