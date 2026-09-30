/**
 * @jest-environment jsdom
 */

const SearchEvents = require('./SearchEvents');

describe('SearchEvents Polygraph', () => {
    let appMock;
    let originalSafeUITimings;
    let originalPerformanceUtils;

    beforeEach(() => {
        jest.useFakeTimers();

        appMock = {
            elements: {
                searchInput: document.createElement('input'),
                searchTriggerBtn: document.createElement('button'),
                clearBtn: document.createElement('button'),
                clearSearchEmptyBtn: document.createElement('button'),
                "category-nav": document.createElement('nav')
            },
            searchController: {
                filterAgents: jest.fn()
            },
            clearSearch: jest.fn()
        };

        originalPerformanceUtils = global.PerformanceUtils;
        global.PerformanceUtils = {
            debounce: (fn) => fn
        };

        originalSafeUITimings = global.SafeUITimings;
        global.SafeUITimings = {
            MODAL_FOCUS_DELAY_MS: 10
        };
    });

    afterEach(() => {
        jest.useRealTimers();
        global.SafeUITimings = originalSafeUITimings;
        global.PerformanceUtils = originalPerformanceUtils;
    });

    it('should handle search input', () => {
        SearchEvents.bind(appMock);
        appMock.elements.searchInput.value = 'test query';
        appMock.elements.searchInput.dispatchEvent(new Event('input'));

        expect(appMock.searchController.filterAgents).toHaveBeenCalledWith('test query');
    });

    it('should handle searchTriggerBtn click, add class, and focus input after timeout', () => {
        SearchEvents.bind(appMock);

        jest.spyOn(appMock.elements.searchInput, 'focus');

        appMock.elements.searchTriggerBtn.click();

        expect(appMock.elements["category-nav"].classList.contains('search-active')).toBe(true);
        expect(appMock.elements.searchInput.focus).not.toHaveBeenCalled();

        jest.advanceTimersByTime(10);

        expect(appMock.elements.searchInput.focus).toHaveBeenCalled();
    });

    it('should clear search when clearBtn is clicked', () => {
        SearchEvents.bind(appMock);
        appMock.elements.clearBtn.click();
        expect(appMock.clearSearch).toHaveBeenCalled();
    });

    it('should clear search when clearSearchEmptyBtn is clicked', () => {
        SearchEvents.bind(appMock);
        appMock.elements.clearSearchEmptyBtn.click();
        expect(appMock.clearSearch).toHaveBeenCalled();
    });

    it('should gracefully handle missing elements', () => {
        const minimalAppMock = {
            elements: {}
        };
        expect(() => {
            SearchEvents.bind(minimalAppMock);
        }).not.toThrow();
    });

    it('should gracefully handle missing category-nav when searchTriggerBtn is clicked', () => {
        const triggerBtn = document.createElement('button');
        const minimalAppMock = {
            elements: {
                searchTriggerBtn: triggerBtn
            }
        };
        SearchEvents.bind(minimalAppMock);
        expect(() => {
            triggerBtn.click();
        }).not.toThrow();
    });
});
