import init from 'js/app/init.js';
import State from 'vendor/dscheinah/sx-js/src/State';

test('init', () => {
    const state = new State();
    init(state);
    expect(state.set.mock.calls[0]).toEqual(['backend-data', ['initial data']]);
});
