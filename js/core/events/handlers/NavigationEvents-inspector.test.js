const NavigationEvents = require('./NavigationEvents');

describe('NavigationEvents Boundary Tests', () => {
    let appMock;

    beforeEach(() => {
        appMock = {
            elements: {},
            switchCategory: jest.fn()
        };
    });

    it('should gracefully handle missing category-nav', () => {
        expect(() => NavigationEvents.bind(appMock)).not.toThrow();
    });

    it('should gracefully handle missing masterDropdownBtn', () => {
        appMock.elements['category-nav'] = document.createElement('div');
        expect(() => NavigationEvents.bind(appMock)).not.toThrow();
    });

    it('should bind click events to tabs and call switchCategory when category exists', () => {
        const nav = document.createElement('div');
        const tab = document.createElement('div');
        tab.classList.add('nav-tab');
        tab.dataset.category = 'test-category';
        nav.appendChild(tab);
        appMock.elements['category-nav'] = nav;

        NavigationEvents.bind(appMock);

        tab.click();
        expect(appMock.switchCategory).toHaveBeenCalledWith('test-category');
    });

    it('should not call switchCategory if dataset.category is missing', () => {
        const nav = document.createElement('div');
        const tab = document.createElement('div');
        tab.classList.add('nav-tab');
        nav.appendChild(tab);
        appMock.elements['category-nav'] = nav;

        NavigationEvents.bind(appMock);

        tab.click();
        expect(appMock.switchCategory).not.toHaveBeenCalled();
    });

    it('should toggle visible class on masterDropdownMenu when masterDropBtn is clicked', () => {
        const btn = document.createElement('button');
        const menu = document.createElement('div');

        appMock.elements.masterDropdownBtn = btn;
        appMock.elements.masterDropdownMenu = menu;

        NavigationEvents.bind(appMock);

        btn.click();
        expect(menu.classList.contains('visible')).toBe(true);

        btn.click();
        expect(menu.classList.contains('visible')).toBe(false);
    });

    it('should not throw if masterDropdownMenu is missing when masterDropBtn is clicked', () => {
        const btn = document.createElement('button');
        appMock.elements.masterDropdownBtn = btn;

        NavigationEvents.bind(appMock);

        expect(() => btn.click()).not.toThrow();
    });
});
