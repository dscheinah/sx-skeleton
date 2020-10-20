const fs = require('fs');
const postcss = require('postcss');
const postcssCSSO = require('postcss-csso');
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');

// There are no default options for postcss, but from needs to be "defined" to disable the warning message.
const options = {from: undefined};

/**
 * Returns the default plugins to be used for compiling.
 *
 * @returns {[]}
 */
function defaults() {
    return [
        postcssPresetEnv(),
        postcssCSSO({
            restructure: false,
            comments: false,
        }),
    ];
}

module.exports = {
    /**
     * Compiles the CSS as an entrypoint. This resolves all imports and writes the output to the dist folder.
     *
     * @param {string} file
     *
     * @returns {Promise<void>}
     */
    entry: async function (file) {
        const plugins = defaults();
        plugins.unshift(postcssImport);
        const result = await postcss(plugins).process(`@import url(${file})`, options);
        fs.writeFileSync(file.replace('../public/', 'dist/'), result.css);
    },
    /**
     * Compiles and returns the CSS to be used for PostHTML in html.js.
     * No imports are resolved to allow reusable libraries to be loaded on demand.
     *
     * @param {string} css
     *
     * @returns {Promise<string[]>}
     */
    inline: async function (css) {
        const result = await postcss(defaults()).process(css, options);
        return [result.css];
    },
};
