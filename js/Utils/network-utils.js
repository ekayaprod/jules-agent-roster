class NetworkUtils {
    static REQUEST_TIMEOUT_MS = 15000;
    static DEFAULT_BACKOFF_MS = 300;
    static MAX_RETRIES = 3;

    static async fetchWithRetry(url, options = {}, retries = NetworkUtils.MAX_RETRIES, backoff = NetworkUtils.DEFAULT_BACKOFF_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), NetworkUtils.REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: options.signal || controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response || typeof response !== 'object') {
                throw new Error("Invalid response object");
            }

            if (!response.ok) {
                if (response.status === 404) {
                    if (options.throwOn404 === false) {
                        return response;
                    } else {
                         throw new Error(`HTTP Error: 404`);
                    }
                }
                if (response.status >= 500) {
                    throw new Error(`Server returned ${response.status}`);
                }

                // Mimic JulesService text parsing for 4xx errors
                let errorMsg = `HTTP Error: ${response.status}`;
                try {
                    const errorText = await response.text();
                    try {
                        const errJson = JSON.parse(errorText);
                        if (errJson.error?.message) {
                            errorMsg = errJson.error.message;
                        } else if (errJson.message) {
                            errorMsg = errJson.message;
                        }
                    } catch {
                        // Ignore parsing errors and stick to fallback
                    }
                } catch {
                    // Ignore text() errors and stick to fallback
                }
                throw new Error(errorMsg);
            }
            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error("The request timed out. Please check your connection and try again.");
            }

            const isServerError = error.message && error.message.startsWith('Server returned');
            const isNetworkError = error.message === 'Network Error' || error.name === 'TypeError' || error.message.includes('fetch') || error.message === "We couldn't reach the server. Please check your internet connection and try again." || isServerError || error.message === "Invalid response object";

            if (retries > 0 && isNetworkError) {
                console.warn(`Retrying ${url} (${retries} left)...`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                return NetworkUtils.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }

            if (isServerError) {
                 throw new Error("We encountered a server error. Please wait a moment and try again.");
            }

            throw error;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkUtils;
} else if (typeof window !== 'undefined') {
    window.NetworkUtils = NetworkUtils;
}
