# transpile-md-to-json

## Transpile multiple markdown files to a single JSON file.

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
  --src <source>        path to content folder
  --dest <destination>  path to JSON file
  --slugify             slugify directory and file names
  --flatten             flatten nested properties
  --blogify             enables slugify and flatten and includes metadata
  --watch               watch source for changes
  -h, --help            output usage information
```

For [CRA](https://www.npmjs.com/package/create-react-app) projects, consider using [concurrently](https://www.npmjs.com/package/concurrently) to run both `start` and `transpile` scripts concurrently using `npm run code`.

```json
# package.json

{
  "scripts": {
    "start": "react-scripts start",
    "transpile": "transpile-md-to-json --src src/content --dest src/content.json --watch",
    "code": "concurrently -n start,transpile npm:start npm:transpile"
  }
}
```

Notice the `--watch` argument? This runs `transpile-md-to-json` in the background, transpiling markdown files as they are created, edited and deleted.

## Examples

**Transpile markdown files in [examples/content](examples/content) to JSON and output result to `stdout`**

```shell
transpile-md-to-json --src examples/content

{
  "fr": {
    "foo": "# Ceci est un test\n"
  },
  "en": {
    "foo": "# This is a test\n",
    "a": {
      "b": {
        "Hello world!": "# This is another test\n"
      }
    }
  }
}
```

**Transpile markdown files in [examples/content](examples/content) to JSON and write result to [examples/content.json](examples/content.json)**

```shell
transpile-md-to-json --src examples/content --dest examples/content.json
cat examples/content.json

{
  "fr": {
    "foo": "# Ceci est un test\n"
  },
  "en": {
    "foo": "# This is a test\n",
    "a": {
      "b": {
        "Hello world!": "# This is another test\n"
      }
    }
  }
}
```

**Transpile and slugify markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-slugify.json](examples/content-slugify.json)**

```shell
transpile-md-to-json --src examples/content --dest examples/content-slugify.json --slugify
cat examples/content-slugify.json

{
  "fr": {
    "foo": "# Ceci est un test\n"
  },
  "en": {
    "foo": "# This is a test\n",
    "a": {
      "b": {
        "hello-world": "# This is another test\n"
      }
    }
  }
}
```

**Transpile and flatten markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-flatten.json](examples/content-flatten.json)**

```shell
transpile-md-to-json --src examples/content --dest examples/content-flatten.json --flatten
cat examples/content-flatten.json

{
  "fr.foo": "# Ceci est un test\n",
  "en.foo": "# This is a test\n",
  "en.a.b.Hello world!": "# This is another test\n"
}
```

**Transpile and blogify markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-blogify.json](examples/content-blogify.json)**

The `id` property is derived from the dot path (`fr.foo` for example) using a [MD5](https://en.wikipedia.org/wiki/MD5) hash function.

```shell
transpile-md-to-json --src examples/content --dest examples/content-blogify.json --blogify
cat examples/content-blogify.json

{
  "fr.foo": {
    "id": "f5fdbc126cb1a123fe8d60297803ea4f",
    "path": "fr/foo.md",
    "basename": "foo.md",
    "createdOn": "2020-02-08T22:44:57.899Z",
    "modifiedOn": "2020-02-24T15:10:47.831Z",
    "content": "# Ceci est un test\n"
  },
  "en.foo": {
    "id": "08e72796bf9fe05dabdc6131a620deaa",
    "path": "en/foo.md",
    "basename": "foo.md",
    "createdOn": "2020-02-08T22:44:57.899Z",
    "modifiedOn": "2020-02-24T15:10:45.310Z",
    "content": "# This is a test\n"
  },
  "en.a.b.hello-world": {
    "id": "44989b6900829b8bfe748c4bca408761",
    "path": "en/a/b/Hello world!.md",
    "basename": "Hello world!.md",
    "createdOn": "2020-02-08T22:44:57.899Z",
    "modifiedOn": "2020-02-24T15:10:46.304Z",
    "content": "# This is another test\n"
  }
}
```

## Contributors

[Sun Knudsen](https://sunknudsen.com/)

## Licence

MIT
