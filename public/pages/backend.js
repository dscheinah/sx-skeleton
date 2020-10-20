import {helper, page, state} from '../js/app.js';

// The ID must match with the one provided at page creation in app.js.
page.register('backend', ({render, show, action, listen}) => {
    // The local state is used for rendering and is updated from the global state.
    // For more complex data you should do some transformations to map the global state to the local state.
    // The key used here matches with the key used in dispatch and listen.
    let data = state.get('backend-data') || [];

    // The callback is called every time the page renders.
    // This happens when the page is shown and after each listen callback (see below) is completed.
    render(() => {
        // The list helper handles updates, inserts and deletes.
        // Each entry of the data array will be given to the callback as item to create a list item.
        helper.list('#backend-list', data, (item) => {
            const element = helper.create('li');
            element.innerText = item;
            return element;
        });
    });

    // This callback is only called once the page is shown (after the initial rendering).
    show(() => {
        helper.focus('#backend-input');
    });

    // Listen to the submit event of the form. The event listener is scoped to only listen for events inside the page.
    action('#backend-form', 'submit', (event) => {
        // The form should not really submit as everything is done by JS only.
        event.preventDefault();
        // Tell the global state to fetch new data from the PHP backend with the provided parameters.
        state.dispatch('backend-data', new FormData(event.target));
        // This may take a while so render the loading animation.
        state.dispatch('loading', true);
    });

    // After the dispatch of backend-data (see above) is done, this callback will be called with the response.
    // The listen callback from the scope is used to automatically trigger re-rendering.
    listen('backend-data', (payload) => {
        // Simply apply the global state to the local state.
        data = payload;
        // Loading is done. This is defined here (and not in app.js) to match with the loading trigger above.
        state.dispatch('loading', false);
    });
});
