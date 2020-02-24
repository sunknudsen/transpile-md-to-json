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
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readdirp_1 = __importDefault(require("readdirp"));
const slugify_1 = __importDefault(require("slugify"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const chalk_1 = __importDefault(require("chalk"));
commander_1.default
    .requiredOption("-s, --src <source>", "path to markdown folder")
    .requiredOption("-d, --dest <destination>", "path to JSON file")
    .option("-w, --watch", "watch source for changes");
commander_1.default.parse(process.argv);
const src = path_1.default.resolve(process.cwd(), commander_1.default.src);
const dest = path_1.default.resolve(process.cwd(), commander_1.default.dest);
if (commander_1.default.watch) {
    chokidar_1.default
        .watch(`${src}/**/*.md`, {
        ignoreInitial: true,
    })
        .on("all", (event, path) => {
        run();
    });
}
const run = async function () {
    var e_1, _a;
    let options = {
        fileFilter: "*.md",
    };
    let markdown = {};
    try {
        console.info("Transpiling...");
        try {
            for (var _b = __asyncValues(readdirp_1.default(src, options)), _c; _c = await _b.next(), !_c.done;) {
                const file = _c.value;
                let parts = file.path.replace(/\md$/, "").split(path_1.default.sep);
                parts.forEach(function (part, index) {
                    parts[index] = slugify_1.default(part, {
                        lower: true,
                        remove: /[^a-zA-Z0-9- ]/g,
                    });
                });
                let dots = parts.join(path_1.default.sep).replace(new RegExp(path_1.default.sep, "g"), ".");
                dot_prop_1.default.set(markdown, dots, fs_1.default.readFileSync(path_1.default.resolve(src, file.path), "utf8"));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        fs_1.default.writeFileSync(dest, JSON.stringify(markdown, null, 2));
        console.info(chalk_1.default.green("Transpiled successfully!"));
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
//# sourceMappingURL=index.js.map