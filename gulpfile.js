const { src, dest, watch, series, parallel } = require('gulp');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat'); // Объединитель. Также может переименовывать
const terser = require('gulp-terser'); // Минифицирует JS
const sync = require('browser-sync').create();

// HTML

const html = () =>
	src('src/*.html')
		.pipe(
			htmlmin({
				removeComments: true,
				collapseWhitespace: true,
			})
		)
		.pipe(concat('index.html'))
		.pipe(dest('dist'))
		.pipe(sync.stream()); // Обновление страницы

exports.html = html;

// Styles

const styles = () =>
	src(['src/styles/**/*.scss'])
		.pipe(concat('index.min.scss')) // Объединяет и переименовывает конечный файл
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(concat('index.min.css')) // Объединяет и переименовывает конечный файл
		.pipe(autoprefixer({ browsersList: 'last 2 versions' }))
		.pipe(dest('dist/styles'))
		.pipe(sync.stream());

exports.styles = styles;

// Scripts

const scripts = () => {
	return src('src/scripts/**/*.js')
		.pipe(concat('main.min.js'))
		.pipe(terser())
		.pipe(dest('dist'))
		.pipe(sync.stream());
};

exports.scripts = scripts;

// Server

const serve = () => {
	sync.init({
		ui: false,
		server: {
			baseDir: 'dist',
		},
	});
};

exports.serve = serve;

// Watcher

const watchAll = () => {
	watch(['src/index.html', 'src/**/*.scss', 'src/**/*.js'], series(html, styles, scripts));
};

exports.watchAll = watchAll;

// Build

exports.build = parallel(html, styles, scripts);

// Default

exports.default = series(parallel(html, styles, scripts), parallel(watchAll, serve));
