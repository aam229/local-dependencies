# Local Dependencies

## Motivation

The `npm link` command can lead to unexpected behaviors: 

 - Dependencies that are present in the root module and the linked module resolve to different instances.
 - Peer dependencies in the linked module are not available.
 - Build tools such as [babel](https://babeljs.io/) fail to find their plugins unless an absolute path is specified.
 
However, `npm link` is extremely useful when working on multiple modules at the same time. It allows a developer to have the local updates available immediately. The goal of this module is to provide the convenience of links while avoiding their pitfalls.

## Usage

Install the `local-dependencies` module by running `npm install --save-dev local-dependencies`. The module defines a few commands that can be used while developing your project, they are:
 
 - **configure-local-dependencies** : Launch the cli to generate a `.ldrc` file in your project. The `.ldrc` file stores information about all your local dependencies and whether they should be watched.
 - **install-local-dependencies** : Install the local dependencies into your project. Your project's npm dependencies are also installed.
 - **watch-local-dependencies** : Install the local dependencies and watch them for changes. When a change is detected in one of the dependency, it is reinstalled into your project.
  
> In order for `configure-local-dependencies` to work, the dependencies should be part of your project's `package.json`.

> If your local dependency defines a `prepublish` script, its dependencies are installed and `npm run prepublish` is executed before copying the content into your root project. 
 
Your project can use the commands defined by the `local-dependencies` module in its own `package.json` scripts to be easily used by other developers: 
 
 ```json
{
  "scripts": {
    "configure-dependencies": "configure-local-dependencies",
    "install-dependencies": "install-local-dependencies",
    "watch-dependencies": "watch-local-dependencies"
  }
}
```

Once your scripts are defined in your project, the developer should:

1. Run `npm run configure-children` to generate the `.ldrc` file.
2. Run `npm run install-dependencies` to install local dependencies into the project.
3. *Optional* Run `npm run watch-dependencies` during development so that updated local dependencies are quickly reinstall. 

> The `watch-children` script should be run from the project's root directory where the `.ldrc` is located.

## Development

This project defines a few npm scripts that you can use to help you develop on this project:

 - Use `npm run compile` to compile the `src` folder using [babel](https://babeljs.io/). The compiled files are put in the `lib` folder.
 - Use `npm run compile-watch` to watch the `src` for changes and recompile the files.
 - Use `npm run docs` to generate the project's documentation
 - Use `npm run docs-watch` to create a documentation server which gets updated continuously
 - Use `npm run lint` to make sure your code conforms to this project's standards
 - Use `npm run fix-lint` to make sure your code conforms to this project's standards and fix simple issues (spacing etc...)

> Make sure you install the dev dependencies in order to use the commands above.



