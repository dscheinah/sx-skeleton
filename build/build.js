const css = require('./modules/css');
const fs = require('fs');
const glob = require('glob');
const html = require('./modules/html');
const js = require('./modules/js');
const path = require('path');

// A very simple hash to be used to refresh the browser caches of all files.
// It is defined once, so that every import of the same file gets the same hash.
const hash = Math.floor(Date.now() / 1000).toString();

/**
 * This is used to create the output folders for each file.
 *
 * @param {string} file
 */
const dist = (file) => {
    let distDir = path.dirname(file).replace('../public/', 'dist/');
    fs.mkdirSync(distDir, {recursive: true});
};

// To get a clean build everything is deleted.
fs.rmSync('dist', {recursive: true, force: true});

// Build all the JavaScript entry points.
// All imports will be resolved. Export of the main file are kept to be used in pages.
[
    '../public/js/app.js',
].forEach((file) => {
    dist(file);
    js.entry(file, hash).catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
});

// Build all CSS entry points. All imports will be resolved.
[
    '../public/css/app.css',
].forEach((file) => {
    dist(file);
    css.entry(file).catch((error) => {
        console.error(error.message);
        process.exit(2);
    });
});

// Build the main HTML file. This minifies and appends a hash to all URLs.
// If you have assets other than html, js and css files, you need to modify the pattern in modules/html.js.
[
    '../public/index.html',
].forEach((file) => {
    dist(file);
    html.entry(file, hash).catch((error) => {
        console.error(error.message);
        process.exit(3);
    });
});

// Build all pages. In addition to the main HTML file this also inlines referenced JavaScript files.
[
    ...glob.sync('../public/pages/**/*.html'),
].forEach((file) => {
    dist(file);
    html.page(file, hash).catch((error) => {
        console.error(error.message);
        process.exit(4);
    });
});

// To keep the deployment simple all other files in the public directory are copied to the dist folder.
// If you need to copy other assets, append them here or modify the deployment script (Dockerfile).
[
    '../public/.htaccess',
    '../public/favicon.ico',
    '../public/index.php',
].forEach((file) => {
    dist(file);
    fs.copyFileSync(file, file.replace('../public/', 'dist/'));
});
