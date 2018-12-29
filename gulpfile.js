const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const tinypng = require('gulp-tinypng');
const del = require("del");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('html', () => {
    return gulp.src('app/index.html')
        .pipe(gulp.dest('build'))
        .on('end', browserSync.reload)
});

gulp.task('styles', () => {
    return gulp.src('app/styles/main.scss')
        .pipe(plumber())
        .pipe(sourceMaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 version']
        }))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('build/css'))
        .on('end', browserSync.reload)
});

gulp.task('js', () => {
    return gulp.src('app/js/**/*.js')
        .pipe(gulp.dest('build/js'))
        .on('end', browserSync.reload)
});
gulp.task('js:libs', () => {
    return gulp.src([
        'node_modules/svg4everybody/dist/svg4everybody.min.js',
        'node_modules/jquery/dist/jquery.min.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js/'));
});
gulp.task('fonts', () => {
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('img', () => {
    return gulp.src('app/img/**/*.{png,jpg,gif}')
        .pipe(tinypng('f8hb3rxYc3LqqwqC1C42883j8g4WXTDh'))
        .pipe(gulp.dest('build/img/'));
});

gulp.task('svg', () => {
    return gulp.src('app/img/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: ($) => {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('build/img/svg/sprite'));
});

gulp.task('svg:copy', () => {
    return gulp.src('app/img/**/*.svg')
        .pipe(gulp.dest('build/img'));
});

gulp.task('clean', () => {
    return del('build');
});

gulp.task('watch', () => {
    gulp.watch("app/styles/**/*.scss", gulp.series("styles"));
    gulp.watch("app/**/*.html", gulp.series("html"));
    gulp.watch("app/js/**/*.js", gulp.series("js"));
    gulp.watch("app/img/**/*.{png,jpg,jpeg,gif", gulp.series("img"));
    gulp.watch("app/img/**/*.{svg}", gulp.series("svg"));
});

gulp.task('serve', () => {
    browserSync.init({
        server: 'build'
    });
});

gulp.task('app', gulp.series(
    'clean',
    gulp.parallel('html', 'styles', 'js', 'img', 'svg', 'svg:copy')
));

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('html', 'styles', 'js', 'js:libs', 'img', 'svg', 'svg:copy'),
    gulp.parallel('watch', 'serve')
));