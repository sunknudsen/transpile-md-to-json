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
const commander_1 = __importDefault(require("commander"));
const util_1 = require("util");
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const fs_1 = __importDefault(require("fs"));
const readdirp_1 = __importDefault(require("readdirp"));
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const camelcase_1 = __importDefault(require("camelcase"));
const crypto_1 = __importDefault(require("crypto"));
const flat_1 = __importDefault(require("flat"));
const chalk_1 = __importDefault(require("chalk"));
commander_1.default
    .requiredOption("--src <source>", "path to content folder")
    .option("--dest <destination>", "path to JSON file")
    .option("--ignore <ignore...>", "paths to ignore")
    .option("--slugify", "slugify folder and file names")
    .option("--flatten", "flatten nested properties")
    .option("--blogify", "enables slugify and flatten and includes metadata")
    .option("--watch", "watch source for changes");
commander_1.default.parse(process.argv);
const src = path_1.default.resolve(process.cwd(), commander_1.default.src);
const ignorePathRegExps = [];
if (commander_1.default.ignore) {
    for (const ignorePath of commander_1.default.ignore) {
        if (fs_1.default.existsSync(path_1.default.resolve(src, ignorePath))) {
            ignorePathRegExps.push(new RegExp(`^${escape_string_regexp_1.default(ignorePath)}`));
        }
    }
}
const fsStatAsync = util_1.promisify(fs_1.default.stat);
const run = async function () {
    var e_1, _a;
    let options = {
        fileFilter: "*.md",
    };
    let data = {};
    try {
        if (commander_1.default.dest) {
            console.info("Transpiling...");
        }
        let blogifyData = {};
        try {
            for (var _b = __asyncValues(readdirp_1.default(src, options)), _c; _c = await _b.next(), !_c.done;) {
                const file = _c.value;
                let ignoreMatch = false;
                for (const ignorePathRegExp of ignorePathRegExps) {
                    if (file.path.match(ignorePathRegExp)) {
                        ignoreMatch = true;
                        break;
                    }
                }
                if (ignoreMatch) {
                    continue;
                }
                let parts = file.path.replace(/\.md$/, "").split(path_1.default.sep);
                if (commander_1.default.slugify || commander_1.default.flatten || commander_1.default.blogify) {
                    parts.forEach(function (part, index) {
                        parts[index] = slugify_1.default(part, { decamelize: false });
                    });
                }
                let dots = parts.join(path_1.default.sep).replace(new RegExp(path_1.default.sep, "g"), ".");
                let content = fs_1.default.readFileSync(path_1.default.resolve(src, file.path), "utf8");
                dot_prop_1.default.set(data, dots, content);
                if (commander_1.default.blogify) {
                    let metadata = {};
                    let headerMatch = content.match(/<!--\n((.|\n)*?)\n-->/);
                    if (headerMatch) {
                        let lines = headerMatch[1].split("\n");
                        for (let line of lines) {
                            if (line.indexOf(":") !== -1) {
                                let lineMatch = line.match(/([^:]+): ?(.+)/);
                                if (lineMatch) {
                                    metadata[camelcase_1.default(slugify_1.default(lineMatch[1], { decamelize: false }))] = lineMatch[2].trim();
                                }
                            }
                        }
                    }
                    let stat = await fsStatAsync(file.fullPath);
                    blogifyData[dots] = {
                        id: crypto_1.default.createHash("md5").update(dots).digest("hex"),
                        path: file.path,
                        basename: file.basename,
                        createdOn: stat.birthtime,
                        modifiedOn: stat.mtime,
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
        if (commander_1.default.flatten || commander_1.default.blogify) {
            data = flat_1.default.flatten(data);
        }
        if (commander_1.default.blogify) {
            for (const property in data) {
                data[property] = blogifyData[property];
            }
        }
        let json = JSON.stringify(data, null, 2);
        if (commander_1.default.dest) {
            let dest = path_1.default.resolve(process.cwd(), commander_1.default.dest);
            fs_1.default.writeFileSync(dest, json);
            console.info(chalk_1.default.green("Transpiled successfully!"));
        }
        else {
            console.log(json);
        }
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
if (commander_1.default.watch) {
    chokidar_1.default
        .watch(`${src}/**/*.md`, {
        ignoreInitial: true,
    })
        .on("add", run)
        .on("change", run)
        .on("unlink", run);
}
//# sourceMappingURL=index.js.map