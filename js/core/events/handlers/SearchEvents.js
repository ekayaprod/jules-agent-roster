class SearchEvents {
    static bind(app) {
        const SEARCH_DEBOUNCE_MS = 300;

        if (app.elements.searchInput) {
            const debouncedFilter = PerformanceUtils.debounce((query) => app.searchController?.filterAgents(query), SEARCH_DEBOUNCE_MS);
            app.elements.searchInput.addEventListener("input", (e) => debouncedFilter(e.target.value));
        }

        if (app.elements.searchTriggerBtn) app.elements.searchTriggerBtn.addEventListener("click", () => {
            const nav = app.elements["category-nav"];
            if (nav) {
                nav.classList.add("search-active");
                setTimeout(() => app.elements.searchInput?.focus(), typeof SafeUITimings !== 'undefined' ? SafeUITimings.MODAL_FOCUS_DELAY_MS || 50 : 50);
            }
        });

        if (app.elements.clearBtn) app.elements.clearBtn.addEventListener("click", () => app.clearSearch());
        if (app.elements.clearSearchEmptyBtn) app.elements.clearSearchEmptyBtn.addEventListener("click", () => app.clearSearch());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEvents;
}
