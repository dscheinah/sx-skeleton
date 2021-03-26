/**
 * Handles an event for navigation. The event target will be checked for a value  to get the requested page ID.
 * If an ID is found, it is assumed to be valid.
 * The state will be used to handle the loading animation. The page is used to do single page navigation.
 *
 * @param {State}             state
 * @param {Page}              page
 * @param {Event}             event
 * @param {HTMLButtonElement} target
 */
export default function(state, page, event, target) {
    let id = target.value;
    if (!id) {
        return;
    }
    // If used with an anchor the navigation should not be handled by the browser.
    event.preventDefault();
    // As pages need to be fetched on first use, trigger the loading animation.
    state.dispatch('loading', true);
    // The href could have been manipulated to be a correct url.
    page.show(id);
}
