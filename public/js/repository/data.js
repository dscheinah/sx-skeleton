/**
 * This is the implementation of an example repository for backend communication.
 * Handles loading of the list of random numbers with a prefix (from payload).
 *
 * @param {FormData} payload
 *
 * @returns {Promise<Array>}
 */
export async function load(payload) {
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
}
