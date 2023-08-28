import { program } from "commander"
import chokidar from "chokidar"
import { dirname, resolve, sep } from "path"
import escapeStringRegexp from "escape-string-regexp"
import fsExtra from "fs-extra"
import readdirp, { ReaddirpOptions } from "readdirp"
import slugify from "@sindresorhus/slugify"
import { setProperty } from "dot-prop"
import camelcase from "camelcase"
import { createHash } from "crypto"
import flat from "flat"
import { execa } from "execa"
import chalk from "chalk"

const { existsSync, readFile, stat, writeFile } = fsExtra
const { flatten } = flat

program
  .requiredOption("--src <source>", "path to content folder")
  .option("--dest <destination>", "path to JSON file")
  .option("--ignore <ignore...>", "paths to ignore")
  .option("--slugify", "slugify folder and file names")
  .option("--flatten", "flatten nested properties")
  .option("--blogify", "enable slugify and flatten and parse metadata")
  .option("--git", "include last Git commit date")
  .option("--watch", "watch source for changes")

program.parse(process.argv)

const options = program.opts()

const src = resolve(process.cwd(), options.src)

const ignorePathRegExps: RegExp[] = []
if (options.ignore) {
  for (const ignorePath of options.ignore) {
    if (existsSync(resolve(src, ignorePath))) {
      ignorePathRegExps.push(new RegExp(`^${escapeStringRegexp(ignorePath)}`))
    }
  }
}

interface Git {
  lastCommitOn?: Date
  numberOfCommits?: Number
}

interface Metadata {
  [key: string]: string
}

interface BlogifyDataProps {
  id: string
  path: string
  dirname: string
  basename: string
  createdOn: Date
  modifiedOn: Date
  git?: Git
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
  const readdirpOptions: ReaddirpOptions = {
    fileFilter: "*.md",
  }
  let data: Data = {}
  try {
    if (options.dest) {
      console.info("Transpiling…")
    }
    const blogifyData: BlogifyData = {}
    for await (const file of readdirp(src, readdirpOptions)) {
      let ignoreMatch = false
      for (const ignorePathRegExp of ignorePathRegExps) {
        if (file.path.match(ignorePathRegExp)) {
          ignoreMatch = true
          break
        }
      }
      if (ignoreMatch === true) {
        continue
      }
      const parts = file.path.replace(/\.md$/, "").split(sep)
      if (options.slugify || options.flatten || options.blogify) {
        parts.forEach(function (part, index) {
          parts[index] = slugify(part, { decamelize: false })
        })
      }
      const dots = parts.join(sep).replace(new RegExp(sep, "g"), ".")
      const content = await readFile(resolve(src, file.path), "utf8")
      setProperty(data, dots, content)
      if (options.blogify === true) {
        const metadata: Metadata = {}
        const headerMatch = content.match(/<!--\n((.|\n)*?)\n-->/)
        if (headerMatch) {
          const lines = headerMatch[1].split("\n")
          for (const line of lines) {
            const lineMatch = line.match(/([^:]+): ?(.+)?/)
            if (lineMatch) {
              const key = camelcase(
                slugify(lineMatch[1], { decamelize: false })
              )
              const value = lineMatch[2] ? lineMatch[2].trim() : ""
              metadata[key] = value
            }
          }
        }
        const fileStat = await stat(file.fullPath)
        let git: Git = {}
        if (options.git === true) {
          const fileDirname = dirname(file.fullPath)
          const gitLog = await execa("git", [
            "-C",
            fileDirname,
            "log",
            "-1",
            '--format="%ad"',
            "--",
            fileDirname,
          ])
          const gitLogStdout = gitLog.stdout
          if (gitLogStdout) {
            git.lastCommitOn = new Date(gitLogStdout)
          }
          const gitRevList = await execa("git", [
            "-C",
            fileDirname,
            "rev-list",
            "--count",
            "HEAD",
            fileDirname,
          ])
          const gitRevListStdout = gitRevList.stdout
          if (gitRevListStdout) {
            git.numberOfCommits = parseInt(gitRevListStdout)
          }
        }
        blogifyData[dots] = {
          id: createHash("md5").update(dots).digest("hex"),
          path: file.path,
          dirname: dirname(file.path),
          basename: file.basename,
          createdOn: fileStat.birthtime,
          modifiedOn: fileStat.mtime,
          git: git,
          metadata: metadata,
          content: content,
        }
      }
    }
    if (options.flatten === true || options.blogify === true) {
      data = flatten(data)
    }
    if (options.blogify === true) {
      for (const property in data) {
        data[property] = blogifyData[property]
      }
    }
    const json = JSON.stringify(data, null, 2)
    if (options.dest) {
      const dest = resolve(process.cwd(), options.dest)
      await writeFile(dest, json)
      console.info(chalk.green("Transpiled successfully!"))
    } else {
      console.info(json)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()

if (options.watch === true) {
  chokidar
    .watch(`${src}/**/*.md`, {
      ignoreInitial: true,
    })
    .on("add", run)
    .on("change", run)
    .on("unlink", run)
}
