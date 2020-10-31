import * as data from 'js/repository/data.js';

global.fetch = jest.fn();
global.fetch.mockResolvedValueOnce({
    ok: true,

    async json() {
        return ['success'];
    },
});
global.fetch.mockResolvedValueOnce({
    ok: false,

    async text() {
        return 'error';
    },
});

const form = new FormData();

test('load', async () => {
    expect(await data.load(form)).toEqual(['success']);
    expect(global.fetch.mock.calls[0]).toEqual(['list', {method: 'POST', body: form}]);
    try {
        await data.load(form);
        expect(false).toBeTruthy();
    } catch (error) {
        expect(error.message).toEqual('error');
    }
});
