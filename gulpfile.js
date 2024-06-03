const gulp = require("gulp");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass")(require("sass"));
const wait = require("gulp-wait");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();

async function styles() {
  const autoprefixer = await import("gulp-autoprefixer");
  return gulp
    .src("./scss/styles.scss")
    .pipe(wait(250))
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err);
          this.emit("end");
        },
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer.default())
    .pipe(gulp.dest("./css"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(gulp.dest("./css"))
    .pipe(browserSync.stream());
}

gulp.task("scripts", function () {
  return gulp
    .src("./js/scripts.js")
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err);
          this.emit("end");
        },
      })
    )
    .pipe(
      babel({
        presets: [["@babel/env", { modules: false }]],
      })
    )
    .pipe(
      uglify({
        output: {
          comments: /^!/,
        },
      })
    )
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest("./dist/js"))
    .pipe(browserSync.stream());
});

gulp.task("styles", styles);

gulp.task("watch", function () {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  gulp.watch("./js/scripts.js", gulp.series("scripts"));
  gulp.watch("./scss/styles.scss", gulp.series("styles"));
  gulp.watch("./*.html").on("change", browserSync.reload);
});

gulp.task("build", gulp.series("styles", "scripts"));

gulp.task("default", gulp.series("build", "watch"));
