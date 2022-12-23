# transpile-md-to-json

## Transpile multiple markdown files to a single JSON file.

This project was developed to transpile all markdown files in a given folder (recursively) to a single JSON file which can be imported in [React](https://reactjs.org/) and supplied to [react-markdown](https://www.npmjs.com/package/react-markdown).

## Features

- Super simple to use
- Uses trusted dependencies ([chalk](https://www.npmjs.com/package/chalk), [chokidar](https://www.npmjs.com/package/chokidar), [commander](https://www.npmjs.com/package/commander), etc…)
- Very light codebase to audit
- Written in TypeScript

## Installation

```shell
npm install transpile-md-to-json -g
```

## Usage

```console
$ transpile-md-to-json -h
Usage: transpile-md-to-json [options]

Options:
  --src <source>        path to content folder
  --dest <destination>  path to JSON file
  --ignore <ignore...>  paths to ignore
  --slugify             slugify folder and file names
  --flatten             flatten nested properties
  --blogify             enable slugify and flatten and parse metadata
  --git                 include last Git commit date
  --watch               watch source for changes
  -h, --help            display help for command
```

For [CRA](https://www.npmjs.com/package/create-react-app) projects, consider using [concurrently](https://www.npmjs.com/package/concurrently) to run both `start` and `transpile` scripts concurrently using `npm run code`.

```json
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

```console
$ transpile-md-to-json --src examples/content
{
  "fr": {
    "foo": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n"
  },
  "es": {
    "foo": "<!--\nTitle: Esto es una prueba\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Esto es una prueba\n"
  },
  "en": {
    "foo bar": "<!--\nTitle: This is another file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is another file name test\n",
    "foo": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n",
    "a": {
      "b": {
        "Hello world!": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
      }
    }
  }
}
```

**Transpile markdown files in [examples/content](examples/content) to JSON ignoring `es` and `en/foo bar.md` paths and output result to `stdout`**

```console
$ transpile-md-to-json --src examples/content --ignore es --ignore "en/foo bar.md"
{
  "fr": {
    "foo": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n"
  },
  "en": {
    "foo": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n",
    "a": {
      "b": {
        "Hello world!": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
      }
    }
  }
}
```

**Transpile markdown files in [examples/content](examples/content) to JSON and write result to [examples/content.json](examples/content.json)**

```console
$ transpile-md-to-json --src examples/content --dest examples/content.json

$ cat examples/content.json
{
  "fr": {
    "foo": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n"
  },
  "es": {
    "foo": "<!--\nTitle: Esto es una prueba\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Esto es una prueba\n"
  },
  "en": {
    "foo bar": "<!--\nTitle: This is another file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is another file name test\n",
    "foo": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n",
    "a": {
      "b": {
        "Hello world!": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
      }
    }
  }
}
```

**Transpile and slugify markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-slugify.json](examples/content-slugify.json)**

```console
$ transpile-md-to-json --src examples/content --dest examples/content-slugify.json --slugify

$ cat examples/content-slugify.json
{
  "fr": {
    "foo": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n"
  },
  "es": {
    "foo": "<!--\nTitle: Esto es una prueba\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Esto es una prueba\n"
  },
  "en": {
    "foo-bar": "<!--\nTitle: This is another file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is another file name test\n",
    "foo": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n",
    "a": {
      "b": {
        "hello-world": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
      }
    }
  }
}
```

**Transpile and flatten markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-flatten.json](examples/content-flatten.json)**

```console
$ transpile-md-to-json --src examples/content --dest examples/content-flatten.json --flatten

$ cat examples/content-flatten.json
{
  "fr.foo": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n",
  "es.foo": "<!--\nTitle: Esto es una prueba\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Esto es una prueba\n",
  "en.foo-bar": "<!--\nTitle: This is another file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is another file name test\n",
  "en.foo": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n",
  "en.a.b.hello-world": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
}
```

**Transpile and blogify markdown files in [examples/content](examples/content) to JSON and write result to [examples/content-blogify.json](examples/content-blogify.json)**

The `id` property is derived from dot path (`fr.foo` for example) using a [MD5](https://en.wikipedia.org/wiki/MD5) hash function.

The `metadata` property is derived from comment block (if present, see [examples/fr/foo.md](examples/content/fr/foo.md)).

Each line is parsed using `/([^:]+): ?(.+)/` and keys are slugified and converted to camel case.

```console
$ transpile-md-to-json --src examples/content --dest examples/content-blogify.json --blogify --git

$ cat examples/content-blogify.json
{
  "fr.foo": {
    "id": "f5fdbc126cb1a123fe8d60297803ea4f",
    "path": "fr/foo.md",
    "dirname": "fr",
    "basename": "foo.md",
    "createdOn": "2020-11-10T12:23:38.000Z",
    "modifiedOn": "2020-11-10T12:23:38.000Z",
    "git": {
      "lastCommitOn": "2020-03-03T19:41:44.000Z",
      "numberOfCommits": 2
    },
    "metadata": {
      "title": "Ceci est un test",
      "publicationDate": "2020-03-03T14:15:23.676Z"
    },
    "content": "<!--\nTitle: Ceci est un test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Ceci est un test\n"
  },
  "es.foo": {
    "id": "94ced16505d73afe6cb2f7528b81f351",
    "path": "es/foo.md",
    "dirname": "es",
    "basename": "foo.md",
    "createdOn": "2020-11-10T12:23:38.000Z",
    "modifiedOn": "2020-11-10T12:23:38.000Z",
    "git": {
      "lastCommitOn": "2020-09-14T11:30:06.000Z",
      "numberOfCommits": 1
    },
    "metadata": {
      "title": "Esto es una prueba",
      "publicationDate": "2020-03-03T14:15:23.676Z"
    },
    "content": "<!--\nTitle: Esto es una prueba\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# Esto es una prueba\n"
  },
  "en.foo-bar": {
    "id": "648d2a8192ed79e49ab9d460a94587af",
    "path": "en/foo bar.md",
    "dirname": "en",
    "basename": "foo bar.md",
    "createdOn": "2020-11-10T12:23:38.000Z",
    "modifiedOn": "2021-11-20T11:27:45.212Z",
    "git": {
      "lastCommitOn": "2020-09-14T11:30:06.000Z",
      "numberOfCommits": 3
    },
    "metadata": {
      "title": "This is another file name test",
      "publicationDate": "2020-03-03T14:15:23.676Z"
    },
    "content": "<!--\nTitle: This is another file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is another file name test\n"
  },
  "en.foo": {
    "id": "08e72796bf9fe05dabdc6131a620deaa",
    "path": "en/foo.md",
    "dirname": "en",
    "basename": "foo.md",
    "createdOn": "2021-11-20T11:57:28.839Z",
    "modifiedOn": "2021-11-20T11:57:28.840Z",
    "git": {
      "lastCommitOn": "2020-09-14T11:30:06.000Z",
      "numberOfCommits": 3
    },
    "metadata": {
      "title": "This is a test",
      "publicationDate": "2020-03-03T14:15:23.676Z"
    },
    "content": "<!--\nTitle: This is a test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a test\n"
  },
  "en.a.b.hello-world": {
    "id": "44989b6900829b8bfe748c4bca408761",
    "path": "en/a/b/Hello world!.md",
    "dirname": "en/a/b",
    "basename": "Hello world!.md",
    "createdOn": "2020-11-10T12:23:38.000Z",
    "modifiedOn": "2020-11-10T12:23:38.000Z",
    "git": {
      "lastCommitOn": "2020-09-14T11:30:06.000Z",
      "numberOfCommits": 3
    },
    "metadata": {
      "title": "This is a file name test",
      "publicationDate": "2020-03-03T14:15:23.676Z"
    },
    "content": "<!--\nTitle: This is a file name test\nPublication date: 2020-03-03T14:15:23.676Z\n-->\n\n# This is a file name test\n"
  }
}
```

## Contributors

[Sun Knudsen](https://sunknudsen.com/)

## Licence

MIT
