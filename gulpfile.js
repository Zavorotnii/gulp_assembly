// Open powerShell in Desktop and write: 
// 1. "Set-ExecutionPolicy RemoteSigned"
// 2. npm install --global gulp-cli

// Open powerShell in ProjectFolder and write:
// 1. npm init
// Answer the questions:
// 1) Name project: "Your name project";
// 2) version: click "Enter"
// 3) description: "bla-bla-bla"
// 4) entry point: "index.html"
// 5) test command: click "Enter"
// 6) git repository: click "Enter"
// 7) keywords: click "Enter"
// 8) author: "Your name"
// 9) license: click "Enter"

// npm install gulp --save-dev
// npm i browser-sync --save-dev
// npm i gulp-file-include --save-dev
// npm i del --save-dev
// npm i sass gulp-sass --save-dev
// npm i gulp-autoprefixer --save-dev
// npm i --save-dev gulp-group-css-media-queries
// npm i --save-dev gulp-clean-css
// npm i --save-dev gulp-rename
// npm i --save-dev gulp-uglify-es
// npm i gulp-imagemin@7.1.0
// npm i --save-dev gulp-webp
// npm i --save-dev gulp-webp-html
// npm i --save-dev gulp-webpcss
// npm install webp-converter@2.2.3 --save-dev

//=========================================================================
let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html",],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass")(require("sass")),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require("gulp-webpcss");

//BROWSER SYNC============================================================
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}
//=========================================================================

//HTML====================================================================
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}
//=========================================================================
//CSS======================================================================
function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: "expanded"
        }))
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}
//===========================================================================
//JS=========================================================================
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}
//===========================================================================
//IMAGES=====================================================================
function images() {
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressiv: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 //0 to 7
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}
//========================================================================
//WATCH FILES=============================================================
function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}
//=========================================================================
//CLEAN FILE IN DIST
function clean(params) {
    return del(path.clean);
}
//=========================================================================
//=========================================================================

let build = gulp.series(clean, gulp.parallel(js, css, html, images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
//=========================================================================
