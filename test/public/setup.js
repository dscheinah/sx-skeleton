jest.mock('js/helper.js');
jest.mock('vendor/dscheinah/sx-js/src/Page.js');
jest.mock('vendor/dscheinah/sx-js/src/State.js');
jest.mock('js/app.js', () => {
    const helper = require('js/helper.js');
    const Page = require('vendor/dscheinah/sx-js/src/Page.js').default;
    const State = require('vendor/dscheinah/sx-js/src/State.js').default;
    return {helper, page: new Page(), state: new State()};
});
