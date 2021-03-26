import navigate from 'js/app/navigate.js';
import State from 'vendor/dscheinah/sx-js/src/State.js';
import Page from 'vendor/dscheinah/sx-js/src/Page.js';

let event, state, page;

beforeEach(() => {
    event = new Event('click');
    state = new State();
    page = new Page(state, document.body);
    Object.defineProperty(event, 'target', {writable: true});
});

test('valid', () => {
    const target = document.createElement('button');
    target.value = 'page1';
    navigate(state, page, event, target);
    expect(state.dispatch.mock.calls[0]).toEqual(['loading', true]);
    expect(page.show.mock.calls[0]).toEqual(['page1']);
});

test('invalid', () => {
    const target = document.createElement('div');
    navigate(state, page, event, target);
    expect(state.dispatch.mock.calls.length).toEqual(0);
    expect(page.show.mock.calls.length).toEqual(0);
});
