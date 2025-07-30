const { src, dest, watch, parallel, series } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const fs = require("fs");
const gulpif = require("gulp-if");

const isDevelopment = process.env.ASPNETCORE_ENVIRONMENT === undefined || process.env.ASPNETCORE_ENVIRONMENT === 'Development';

const paths = {
  scripts: {
    src: ["Scripts/**/*.js"],
    dest: "wwwroot/js/"
  }
};

function minifyJs(callback) {
  src(paths.scripts.src)
    .pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(uglify())
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(paths.scripts.dest));
  callback();
}

function watchFiles(callback) {
  watch(paths.scripts.src, minifyJs);
  callback();
}

function cleanJs(callback) {
  const files = [];
  fs.readdirSync("Scripts").forEach(file => {
    const name = file.replace(".js", ".min.js");
    files.push(`${paths.scripts.dest}${name}`);
  });
  del.sync(files);
  callback();
}

exports.clean = parallel(cleanJs);
exports.build = isDevelopment ? parallel(minifyJs) : parallel(minifyJs);
exports.watch = series(exports.clean, parallel(minifyJs), watchFiles);
exports.js = minifyJs;
