const css = require('./css');
const fs = require('fs');
const js = require('./js');
const path = require('path');
const postHtml = require('posthtml');
const postHtmlInlineAssets = require('posthtml-inline-assets');
const postHtmlMinifier = require('posthtml-minifier');

// A simple wrapper that allows the usage of inline functions from css.js and js.js as PostHTML plugins.
function plugin(callback, type) {
    return (tree) => {
        let promises = [];
        tree.walk((node) => {
            if (node.tag === type && node.content) {
                promises.push(callback(node.content.toString()).then(script => node.content = script));
            }
            return node;
        });
        return Promise.all(promises).then(() => tree);
    };
}

// The default plugins to be used.
const plugins = [
    plugin(js.inline, 'script'),
    plugin(css.inline, 'style'),
    postHtmlMinifier({
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: false,
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
    }),
];

module.exports = {
    /**
     * Minifies and writes the entry point HTML file to the dist folder.
     *
     * @param {string} file
     * @param {string} hash
     *
     * @returns {Promise<void>}
     */
    entry: async function (file, hash) {
        const html = fs.readFileSync(file);
        const result = await postHtml(plugins).process(html.toString());
        fs.writeFileSync(
            file.replace('../public/', 'dist/'),
            // Append the hash to all URLs. This is done be searching for file extensions. Change these if needed.
            result.html.replace(/\/(.*?)\.(css|js|html)/ig, `/$1.$2?${hash}`)
        );
    },
    /**
     * Minifies and writes a page HTML file to the dist folder.
     * In addition, all directly referenced scripts are inlined.
     *
     * @param {string} file
     * @param {string} hash
     *
     * @returns {Promise<void>}
     */
    page: async function (file, hash) {
        const html = fs.readFileSync(file);
        const result = await postHtml([
            postHtmlInlineAssets({
                // To resolve the relative inline URLs the plugin needs to run in the directory scope of the page.
                cwd: path.dirname(file),
                root: '../public/',
            }),
            ...plugins
        ]).process(html.toString());
        fs.writeFileSync(
            file.replace('../public/', 'dist/'),
            // Append the hash to all URLs. This is done be searching for file extensions. Change these if needed.
            result.html.replace(/\/(.*?)\.(css|js|html)/ig, `/$1.$2?${hash}`)
        );
    },
};
