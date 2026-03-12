importScripts("https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js");

let fuseInstance = null;

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
