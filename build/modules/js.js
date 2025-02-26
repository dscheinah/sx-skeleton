const path = require('path');
const rollup = require('rollup');
const rollupBabel = require('@rollup/plugin-babel');
const rollupCommonJs = require('@rollup/plugin-commonjs');
const rollupNodeResolve = require('@rollup/plugin-node-resolve');
const rollupTerser = require('@rollup/plugin-terser');
const rollupVirtual = require('@rollup/plugin-virtual');

/**
 * Creates the default configuration with plugins.
 *
 * @returns {{}}
 */
function defaults() {
    return {
        output: {
            compact: true,
        },
        plugins: [
            // NodeResolve and CommonJS are needed to resolve the babel polyfills and runtime.
            rollupNodeResolve.nodeResolve({
                modulePaths: [
                    'node_modules',
                    path.normalize(`${path.dirname(__filename)}/../node_modules`),
                ],
            }),
            rollupCommonJs(),
            rollupBabel.babel({
                babelHelpers: 'runtime',
                presets: ['@babel/preset-env'],
                plugins: [
                    // Enable the import of polyfills and runtime.
                    '@babel/plugin-transform-runtime',
                    // Class properties are used by the sx library.
                    '@babel/plugin-proposal-class-properties',
                ],
            }),
            rollupTerser(),
        ],
    };
}

module.exports = {
    /**
     * Compiles an entry point JS file and writes the output to the dist folder.
     * All imports are resolved but exports of the main file are kept to be used in pages.
     *
     * @param {string} file
     * @param {string} hash
     *
     * @returns {Promise<void>}
     */
    entry: async function (file, hash) {
        const options = defaults();
        options.input = file;
        options.output.file = file.replace('../public/', 'dist/');
        options.output.compact = true;
        options.plugins.unshift({
            transform(code) {
                return {
                    code: code.replace(/\/(.*?)\.(html)(\W)/ig, `/$1.$2?${hash}$3`),
                    map: null,
                }
            }
        });
        const bundle = await rollup.rollup(options);
        await bundle.write(options.output);
    },
    /**
     * Compiles the script to be used in html.js.
     * This does not resolve any imports to allow dynamic loading of resources and entry points.
     *
     * @param {string} script
     *
     * @returns {Promise<[]>}
     */
    inline: async function (script) {
        const options = defaults();
        options.input = 'code';
        options.external = /.*(cwd-replacement).*/;
        options.plugins.unshift(
            // As there is no file an extra plugin is needed.
            // Relative paths are masked to prevent rollup from replacing them with absolute file system paths.
            rollupVirtual({
                code: script.replaceAll('./', 'cwd-replacement')
            }),
        );
        const bundle = await rollup.rollup(options);
        const {output} = await bundle.generate(options.output);
        const content = [];
        for (const asset of output) {
            // Undo the mask of relative paths (see above).
            content.push(asset.code.replaceAll('cwd-replacement', './'));
        }
        return content;
    },
};
