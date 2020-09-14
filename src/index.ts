"use strict"

import program from "commander"
import { promisify } from "util"
import chokidar from "chokidar"
import path from "path"
import escapeStringRegexp from "escape-string-regexp"
import fs from "fs"
import readdirp, { ReaddirpOptions } from "readdirp"
import slugify from "@sindresorhus/slugify"
import dotProp from "dot-prop"
import camelcase from "camelcase"
import crypto from "crypto"
import flat from "flat"
import chalk from "chalk"

program
  .requiredOption("--src <source>", "path to content folder")
  .option("--dest <destination>", "path to JSON file")
  .option("--ignore <ignore...>", "paths to ignore")
  .option("--slugify", "slugify folder and file names")
  .option("--flatten", "flatten nested properties")
  .option("--blogify", "enables slugify and flatten and includes metadata")
  .option("--watch", "watch source for changes")

program.parse(process.argv)

const src = path.resolve(process.cwd(), program.src)

const ignorePathRegExps: RegExp[] = []
if (program.ignore) {
  for (const ignorePath of program.ignore) {
    if (fs.existsSync(path.resolve(src, ignorePath))) {
      ignorePathRegExps.push(new RegExp(`^${escapeStringRegexp(ignorePath)}`))
    }
  }
}

const fsStatAsync = promisify(fs.stat)

interface Metadata {
  [key: string]: string
}

interface BlogifyDataProps {
  id: string
  path: string
  basename: string
  createdOn: Date
  modifiedOn: Date
  metadata: Metadata
  content: string
}

interface Data {
  [key: string]: string | BlogifyDataProps
}

interface BlogifyData {
  [key: string]: BlogifyDataProps
}

const run = async function () {
  let options: ReaddirpOptions = {
    fileFilter: "*.md",
  }
  let data: Data = {}
  try {
    if (program.dest) {
      console.info("Transpiling...")
    }
    let blogifyData: BlogifyData = {}
    for await (const file of readdirp(src, options)) {
      let ignoreMatch = false
      for (const ignorePathRegExp of ignorePathRegExps) {
        if (file.path.match(ignorePathRegExp)) {
          ignoreMatch = true
          break
        }
      }
      if (ignoreMatch) {
        continue
      }
      let parts = file.path.replace(/\.md$/, "").split(path.sep)
      if (program.slugify || program.flatten || program.blogify) {
        parts.forEach(function (part, index) {
          parts[index] = slugify(part, { decamelize: false })
        })
      }
      let dots = parts.join(path.sep).replace(new RegExp(path.sep, "g"), ".")
      let content = fs.readFileSync(path.resolve(src, file.path), "utf8")
      dotProp.set(data, dots, content)
      if (program.blogify) {
        let metadata: Metadata = {}
        let headerMatch = content.match(/<!--\n((.|\n)*?)\n-->/)
        if (headerMatch) {
          let lines = headerMatch[1].split("\n")
          for (let line of lines) {
            if (line.indexOf(":") !== -1) {
              let lineMatch = line.match(/([^:]+): ?(.+)/)
              if (lineMatch) {
                metadata[
                  camelcase(slugify(lineMatch[1], { decamelize: false }))
                ] = lineMatch[2].trim()
              }
            }
          }
        }
        let stat = await fsStatAsync(file.fullPath)
        blogifyData[dots] = {
          id: crypto.createHash("md5").update(dots).digest("hex"),
          path: file.path,
          basename: file.basename,
          createdOn: stat.birthtime,
          modifiedOn: stat.mtime,
          metadata: metadata,
          content: content,
        }
      }
    }
    if (program.flatten || program.blogify) {
      data = flat.flatten(data)
    }
    if (program.blogify) {
      for (const property in data) {
        data[property] = blogifyData[property]
      }
    }
    let json = JSON.stringify(data, null, 2)
    if (program.dest) {
      let dest = path.resolve(process.cwd(), program.dest)
      fs.writeFileSync(dest, json)
      console.info(chalk.green("Transpiled successfully!"))
    } else {
      console.log(json)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()

if (program.watch) {
  chokidar
    .watch(`${src}/**/*.md`, {
      ignoreInitial: true,
    })
    .on("add", run)
    .on("change", run)
    .on("unlink", run)
}
