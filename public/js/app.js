import Action from '../vendor/dscheinah/sx-js/src/Action.js';
import Page from '../vendor/dscheinah/sx-js/src/Page.js';
import State from '../vendor/dscheinah/sx-js/src/State.js';
// By separating the helpers to it's own namespace they do not need to packed to an object here.
import * as helper from './helper.js';

// Create the global event listener (on window) to be used for e.g. navigation.
const action = new Action(window);
// Create the global state manager.
const state = new State();
// Create the page manager responsible for lazy loading pages and handling the history and page stack.
// The state manager is used to trigger sx-show and sx-hide when the state of pages changes.
// The state event gets the ID of the page as payload.
const page = new Page(state, helper.element('#main'));

// This defines the initial application state. This can also be loaded from e.g. localStorage or a backend.
state.set('backend-data', ['initial data']);

// Handle the global navigation. This also handles links in pages automatically.
// To add a link use <a href="${id}" data-navigation></a> or <button value="${id}" data-navigation></button>.
// The IDs must correspond with the pages defined later in this file.
action.listen('[data-navigation]', 'click', (event) => {
    if (!event.target) {
        return;
    }
    let id = event.target.value || event.target.href;
    if (!id) {
        return;
    }
    // As pages need to be fetched on first use, trigger the loading animation.
    state.dispatch('loading', true);
    page.show(id);
});
// The navigation-back button is invisible but keyboard controllable.
action.listen('#navigation-back', 'click', () => {
    history.back();
});

// Always disable the loading animation when any loaded page is ready.
state.listen('sx-show', () => {
    state.dispatch('loading', false);
});

// A global state handler to show the loading animation.
// Use state.dispatch('loading', true) to trigger the animation and state.dispatch('loading', false) to stop it.
state.handle('loading', (payload, next) => {
    // The element is hidden by using visibility to not need extra CSS for positioning of the menu entries.
    helper.style('#loading', 'visibility', payload ? null : 'hidden');
    return next(payload);
});

// This is a simple example for async global state management.
// Usually you will restructure this in separate files and repositories.
state.handle('backend-data', async (payload) => {
    let result = await fetch('list', {
        method: 'POST',
        body: payload,
    });
    if (result.ok) {
        return result.json();
    }
    // This is just an example. Implement real error handling here.
    // Never rely on throw to trigger the global error handler registered in index.html.
    throw new Error(await result.text());
});

// Define all pages and load the main page. The ID defined here is globally used for:
//  - handling navigation by href or value (see above)
//  - registering scopes in pages
//  - payload of sx-show and sx-hide state events
// For real routing you can replace window.location.href with custom paths for each page.
page.add('home', 'pages/home.html', window.location.href);
page.add('backend', 'pages/backend.html', window.location.href);
// If used with routing this must be replaced with a check on the called route.
page.show('home');

// The app.js file is used as a kind of service manager for dependency injection.
// Import the file in pages to get access to the exported modules.
export {helper, page, state};
