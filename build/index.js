"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = require("path");
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const fs_extra_1 = require("fs-extra");
const readdirp_1 = __importDefault(require("readdirp"));
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const camelcase_1 = __importDefault(require("camelcase"));
const crypto_1 = require("crypto");
const flat_1 = require("flat");
const execa_1 = __importDefault(require("execa"));
const chalk_1 = __importDefault(require("chalk"));
commander_1.program
    .requiredOption("--src <source>", "path to content folder")
    .option("--dest <destination>", "path to JSON file")
    .option("--ignore <ignore...>", "paths to ignore")
    .option("--slugify", "slugify folder and file names")
    .option("--flatten", "flatten nested properties")
    .option("--blogify", "enable slugify and flatten and parse metadata")
    .option("--git", "include last Git commit date")
    .option("--watch", "watch source for changes");
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const src = path_1.resolve(process.cwd(), options.src);
const ignorePathRegExps = [];
if (options.ignore) {
    for (const ignorePath of options.ignore) {
        if (fs_extra_1.existsSync(path_1.resolve(src, ignorePath))) {
            ignorePathRegExps.push(new RegExp(`^${escape_string_regexp_1.default(ignorePath)}`));
        }
    }
}
const run = async function () {
    var e_1, _a;
    const readdirpOptions = {
        fileFilter: "*.md",
    };
    let data = {};
    try {
        if (options.dest) {
            console.info("Transpiling...");
        }
        const blogifyData = {};
        try {
            for (var _b = __asyncValues(readdirp_1.default(src, readdirpOptions)), _c; _c = await _b.next(), !_c.done;) {
                const file = _c.value;
                let ignoreMatch = false;
                for (const ignorePathRegExp of ignorePathRegExps) {
                    if (file.path.match(ignorePathRegExp)) {
                        ignoreMatch = true;
                        break;
                    }
                }
                if (ignoreMatch === true) {
                    continue;
                }
                const parts = file.path.replace(/\.md$/, "").split(path_1.sep);
                if (options.slugify || options.flatten || options.blogify) {
                    parts.forEach(function (part, index) {
                        parts[index] = slugify_1.default(part, { decamelize: false });
                    });
                }
                const dots = parts.join(path_1.sep).replace(new RegExp(path_1.sep, "g"), ".");
                const content = await fs_extra_1.readFile(path_1.resolve(src, file.path), "utf8");
                dot_prop_1.default.set(data, dots, content);
                if (options.blogify === true) {
                    const metadata = {};
                    const headerMatch = content.match(/<!--\n((.|\n)*?)\n-->/);
                    if (headerMatch) {
                        const lines = headerMatch[1].split("\n");
                        for (const line of lines) {
                            if (line.indexOf(":") !== -1) {
                                const lineMatch = line.match(/([^:]+): ?(.+)/);
                                if (lineMatch) {
                                    metadata[camelcase_1.default(slugify_1.default(lineMatch[1], { decamelize: false }))] = lineMatch[2].trim();
                                }
                            }
                        }
                    }
                    const fileStat = await fs_extra_1.stat(file.fullPath);
                    let lastGitCommitOn = undefined;
                    if (options.git === true) {
                        const fileDirname = path_1.dirname(file.fullPath);
                        const { stdout } = await execa_1.default("git", [
                            "-C",
                            fileDirname,
                            "log",
                            "-1",
                            '--format="%ad"',
                            "--",
                            fileDirname,
                        ]);
                        if (stdout) {
                            lastGitCommitOn = new Date(stdout);
                        }
                    }
                    blogifyData[dots] = {
                        id: crypto_1.createHash("md5").update(dots).digest("hex"),
                        path: file.path,
                        dirname: path_1.dirname(file.path),
                        basename: file.basename,
                        createdOn: fileStat.birthtime,
                        modifiedOn: fileStat.mtime,
                        lastGitCommitOn: lastGitCommitOn,
                        metadata: metadata,
                        content: content,
                    };
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (options.flatten === true || options.blogify === true) {
            data = flat_1.flatten(data);
        }
        if (options.blogify === true) {
            for (const property in data) {
                data[property] = blogifyData[property];
            }
        }
        const json = JSON.stringify(data, null, 2);
        if (options.dest) {
            const dest = path_1.resolve(process.cwd(), options.dest);
            await fs_extra_1.writeFile(dest, json);
            console.info(chalk_1.default.green("Transpiled successfully!"));
        }
        else {
            console.info(json);
        }
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
if (options.watch === true) {
    chokidar_1.default
        .watch(`${src}/**/*.md`, {
        ignoreInitial: true,
    })
        .on("add", run)
        .on("change", run)
        .on("unlink", run);
}
//# sourceMappingURL=index.js.map