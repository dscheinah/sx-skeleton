const {helper, page, state} = require('js/app.js');

const empty = () => {
};

beforeEach(() => {
   jest.resetAllMocks();
});

test('local state', () => {
    page.register.mockImplementation((id, callback) => {
        callback({render: empty, show: empty, action: empty, listen: empty});
    });
    jest.isolateModules(() => {
        require('pages/backend.js');
        expect(page.register.mock.calls.length).toEqual(1);
        expect(page.register.mock.calls[0][0]).toEqual('backend');
        expect(state.get.mock.calls.length).toEqual(1);
        expect(state.get.mock.calls[0][0]).toEqual('backend-data');
    });
});

test('render', () => {
    page.register.mockImplementation((id, callback) => {
        callback({render: (callback) => callback(), show: empty, action: empty, listen: empty});
    });
    helper.create.mockReturnValue(document.createElement('li'));
    helper.list.mockImplementation((selector, data, callback) => {
        expect(callback('item').innerText).toEqual('item');
    });
    jest.isolateModules(() => {
        require('pages/backend.js');
        expect(helper.list.mock.calls.length).toEqual(1);
        expect(helper.list.mock.calls[0][0]).toEqual('#backend-list');
        expect(helper.create.mock.calls[0]).toEqual(['li']);
    });
});

test('show', () => {
    page.register.mockImplementation((id, callback) => {
        callback({render: empty, show: (callback) => callback(), action: empty, listen: empty});
    });
    jest.isolateModules(() => {
        require('pages/backend.js');
        expect(helper.focus.mock.calls[0]).toEqual(['#backend-input']);
    });
});

test('action', () => {
    const event = new Event('submit');
    Object.defineProperty(event, 'target', {
        writable: false,
        value: document.createElement('form'),
    });
    jest.spyOn(event, 'preventDefault');

    page.register.mockImplementation((id, callback) => {
        const action = (selector, type, callback) => {
            expect(selector).toEqual('#backend-form');
            expect(type).toEqual('submit');
            callback(event);
        };
        callback({render: empty, show: empty, action, listen: empty});
    });
    jest.isolateModules(() => {
        require('pages/backend.js');
        expect(event.preventDefault.mock.calls.length).toEqual(1);
        expect(state.dispatch.mock.calls.length).toEqual(2);
        expect(state.dispatch.mock.calls[0][0]).toEqual('backend-data');
        expect(state.dispatch.mock.calls[0][1]).toBeInstanceOf(FormData);
        expect(state.dispatch.mock.calls[1]).toEqual(['loading', true]);
    });
});

test('listen', () => {
    page.register.mockImplementation((id, callback) => {
        let render;
        const listen = (name, callback) => {
            expect(name).toEqual('backend-data');
            callback(['loaded item']);
            render();
        };
        callback({render: (callback) => render = callback, show: empty, action: empty, listen});
    });
    helper.list.mockImplementation((selector, data) => {
        expect(data).toEqual(['loaded item']);
    });
    jest.isolateModules(() => {
        require('pages/backend.js');
        expect(state.dispatch.mock.calls[0]).toEqual(['loading', false]);
    });
});
