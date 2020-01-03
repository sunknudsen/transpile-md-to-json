'use strict';

import program from 'commander';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import readdirp from 'readdirp';
import dotProp from 'dot-prop';
import chalk from 'chalk';

program
  .requiredOption('-s, --src <source>', 'path to markdown folder')
  .requiredOption('-d, --dest <destination>', 'path to JSON file')
  .option('-w, --watch', 'watch source for changes')

program.parse(process.argv);

const src = path.resolve(process.cwd(), program.src);
const dest = path.resolve(process.cwd(), program.dest);

if (program.watch) {
  chokidar.watch(`${src}/**/*.md`, {
    ignoreInitial: true
  }).on('all', (event, path) => {
    run();
  });
}

const run = async function() {
  let options = {
    fileFilter: '*.md'
  }
  let markdown = {};
  try {
    console.info('Transpiling...');
    for await (const file of readdirp(src, options)) {
      let regExp = new RegExp(path.sep, 'g');
      let dots = file.path.replace(regExp, '.').replace('.md', '');
      dotProp.set(markdown, dots, fs.readFileSync(path.resolve(src, file.path), 'utf8'));
    }
    fs.writeFileSync(dest, JSON.stringify(markdown, null, 2));
    console.info(chalk.green('Transpiled successfully!'));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
