class NavigationEvents {
    static bind(app) {
        if (app.elements["category-nav"]) {
            const tabs = app.elements["category-nav"].querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    if (category) {
                        app.switchCategory(category);
                    }
                });
            });
        }

        const masterDropBtn = app.elements.masterDropdownBtn;
        const masterDropMenu = app.elements.masterDropdownMenu;

        if (masterDropBtn) masterDropBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (masterDropMenu) masterDropMenu.classList.toggle("visible");
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationEvents;
}
