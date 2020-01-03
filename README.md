# transpile-md-to-json

## Transpile markdown files to a single JSON file

This project was developed to transpile all markdown files in a given folder (recursively) to a single JSON file which can be imported in [React](https://reactjs.org/) and fed to [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx).


## Features

- Super simple to use
- Uses trusted dependencies ([chalk](https://www.npmjs.com/package/chalk), [chokidar](https://www.npmjs.com/package/chokidar), [commander](https://www.npmjs.com/package/commander), etc...)
- Actively maintained and used by the [Lickstats](https://lickstats.com/) team
- Very light codebase to audit
- Written in TypeScript

## Installation

```shell
npm install transpile-md-to-json -g
```

## Usage

```shell
# transpile-md-to-json -h

Usage: index [options]

Options:
  -s, --src <source>        path to markdown folder
  -d, --dest <destination>  path to JSON file
  -w, --watch               watch source for changes
  -h, --help                output usage information
```

For [CRA](https://www.npmjs.com/package/create-react-app) projects, consider using [concurrently](https://www.npmjs.com/package/concurrently) to run both `start` and `markdown` scripts concurrently using `npm run code`.

```json
# package.json

{
  "scripts": {
    "start": "react-scripts start",
    "markdown": "transpile-md-to-json -s src/markdown -d src/markdown.json -w",
    "code": "concurrently -n start,markdown npm:start npm:markdown"
  }
}
```

Notice the `-w` argument? This runs `transpile-md-to-json` in the background, transpiling markdown files as they are created, edited and deleted.

## Demo

Have a look at the markdown files in [demo/markdown](demo/markdown). They have been transpiled to [demo/markdown.json](demo/markdown.json) using the following command.

```shell
transpile-md-to-json -s demo/markdown -d demo/markdown.json
```

## Contributors

[Sun Knudsen](https://sunknudsen.com/)

## Licence

MIT