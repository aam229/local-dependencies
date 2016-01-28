# Local Dependencies

## Motivation
The `npm link` command can lead to unexpected behaviors: 

 - Dependencies that are present in the root module and the linked module resolve to different instances.
 - Peer dependencies in the linked module are not available.
 - Build tools such as [babel](https://babeljs.io/) fail to find their plugins unless an absolute path is specified.
 
However, `npm link` is extremely useful when working on multiple modules at the same time. It allows a developer to have the local updates available immediately. The goal of this module is to provide the convenience of links while avoiding their pitfalls.

## Usage

Install the `local-dependencies` module by running `npm install --save-dev local-dependencies`. Define a `.ldrc` file that specifies the path in which your local dependencies are saved. It has the following format:
 
 ```json
 {
   "paths": [
     "/var/apps/external/"
   ]
 } 
 ```
 
 > The specified paths are walked recursively to find npm modules.
 
Add the `watch-local-dependencies` script to your `package.json`:

```json
{
  "watch-dependencies": "watch-local-dependencies"
}
```

Run `npm run watch-dependencies`. 

> The `watch-local-dependencies` script will check that all the packages defined by your local projects are installed. It may take a bit of time to execute the first time if you are missing some external dependencies.


