importScripts("https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js");

/**
 * The initialized Fuse.js instance for fuzzy matching.
 * @type {Object|null}
 */
let fuseInstance = null;

/**
 * Web Worker message handler for offloading fuzzy search execution.
 * @see README.md#fuzzy-matching for the macro architecture of fuzzy matching.
 *
 * @param {MessageEvent} e - The message event from the main thread.
 * @param {Object} e.data - The payload.
 * @param {string} e.data.type - The operation type: 'init' or 'search'.
 * @param {Array<Object>} [e.data.data] - The dataset to index (used on 'init').
 * @param {Object} [e.data.options] - Fuse.js configuration options (used on 'init').
 * @param {string} [e.data.query] - The search string (used on 'search').
 * @param {string|number} [e.data.searchId] - A unique identifier for the search request.
 */
self.onmessage = function(e) {
    const { type, data, options, query, searchId } = e.data;

    if (type === 'init') {
        fuseInstance = new Fuse(data, options);
        self.postMessage({ type: 'init_complete' });
    } else if (type === 'search') {
        if (!fuseInstance) {
            self.postMessage({ type: 'error', message: 'Fuse not initialized', searchId });
            return;
        }

        try {
            const results = fuseInstance.search(query);
            self.postMessage({ type: 'results', results, searchId });
        } catch (error) {
            self.postMessage({ type: 'error', message: error.message, searchId });
        }
    }
};
