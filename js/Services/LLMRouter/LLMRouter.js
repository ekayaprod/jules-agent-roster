class LLMConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMConfigurationError';
    }
}

class LLMNetworkError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'LLMNetworkError';
        this.status = status;
    }
}

class LLMTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMTimeoutError';
    }
}

class LLMValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMValidationError';
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Modern LLM Router supporting state-of-the-art handshakes with OpenAI and Anthropic.
 * Includes strict validation, AbortController timeouts, and exponential backoff retries.
 */
class LLMRouter {
    constructor() {
        this.openAiKey = null;
        this.anthropicKey = null;
        this.timeoutMs = 15000;
        this.maxRetries = 3;
        this.baseBackoffMs = 1000;

        // Dynamically initialize with process.env if available (Node.js/Test context)
        if (typeof process !== 'undefined' && process.env) {
            this.openAiKey = process.env.OPENAI_API_KEY || null;
            this.anthropicKey = process.env.ANTHROPIC_API_KEY || null;
        }
    }

    /**
     * Set API keys securely via environment abstractions rather than hardcoded raw keys.
     */
    configure(openAiKey = null, anthropicKey = null) {
        if (openAiKey) this.openAiKey = openAiKey;
        if (anthropicKey) this.anthropicKey = anthropicKey;
    }

    _validateAuthHeader(key, provider) {
        if (!key || typeof key !== 'string' || key.trim() === '') {
            throw new LLMConfigurationError(`${provider} API key is missing or invalid type.`);
        }
    }

    _validateMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new LLMValidationError("Payload must contain a non-empty array of messages.");
        }
        for (const msg of messages) {
            if (!msg.role || !msg.content || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
                throw new LLMValidationError("Each message must have string 'role' and 'content' properties.");
            }
        }
    }

    async _fetchWithRetry(url, options, provider) {
        let attempt = 0;
        while (attempt <= this.maxRetries) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    let errorMsg = `${provider} API Error (${response.status})`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error?.message || errorMsg;
                    } catch (e) {
                        // Fallback to text
                        try {
                            const errorText = await response.text();
                            errorMsg = errorText || errorMsg;
                        } catch (e2) {
                            errorMsg = `${errorMsg} (Unparseable response body: ${e2.message})`;
                        }
                    }

                    if (response.status >= 500 || response.status === 429) {
                        const error = new LLMNetworkError(errorMsg, response.status);
                        if (attempt < this.maxRetries) {
                            throw error; // Caught by catch block below for retry
                        }
                        throw error;
                    }
                    throw new LLMNetworkError(errorMsg, response.status);
                }

                return await response.json();

            } catch (error) {
                clearTimeout(timeoutId);

                let isRetryable = false;
                if (error.name === 'AbortError') {
                    isRetryable = true;
                    error = new LLMTimeoutError(`Request to ${provider} timed out after ${this.timeoutMs}ms.`);
                } else if (error instanceof LLMNetworkError && (error.status >= 500 || error.status === 429)) {
                    isRetryable = true;
                } else if (error.message.includes('fetch') || error.name === 'TypeError') {
                    isRetryable = true;
                }

                if (isRetryable && attempt < this.maxRetries) {
                    attempt++;
                    const backoffTime = this.baseBackoffMs * Math.pow(2, attempt - 1);
                    await delay(backoffTime);
                    continue;
                }

                console.error(`[LLMRouter] Final failure for ${provider}:`, error);
                throw error;
            }
        }
    }

    /**
     * Route a request to OpenAI chat completions
     */
    async chatOpenAI(messages, model = "gpt-4o", temperature = 0.7) {
        this._validateAuthHeader(this.openAiKey, "OpenAI");
        this._validateMessages(messages);

        if (typeof model !== 'string') {
            throw new LLMValidationError("Model must be a string.");
        }

        const payload = {
            model: model,
            messages: messages,
            temperature: temperature
        };

        return this._fetchWithRetry("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.openAiKey}`
            },
            body: JSON.stringify(payload)
        }, "OpenAI");
    }

    /**
     * Route a request to Anthropic Messages API
     */
    async chatAnthropic(messages, model = "claude-3-5-sonnet-latest", temperature = 0.7, maxTokens = 4096) {
        this._validateAuthHeader(this.anthropicKey, "Anthropic");
        this._validateMessages(messages);

        if (typeof model !== 'string') {
            throw new LLMValidationError("Model must be a string.");
        }

        // Convert common chat structure to Anthropic schema if necessary
        // Anthropic requires top-level system message if any
        let systemMessage = undefined;
        const anthropicMessages = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                if (!systemMessage) systemMessage = msg.content;
                else systemMessage += "\n" + msg.content;
            } else {
                anthropicMessages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            }
        }

        if (anthropicMessages.length === 0) {
            throw new LLMValidationError("Payload must contain at least one user or assistant message for Anthropic.");
        }

        const payload = {
            model: model,
            messages: anthropicMessages,
            max_tokens: maxTokens,
            temperature: temperature
        };

        if (systemMessage) {
            payload.system = systemMessage;
        }

        return this._fetchWithRetry("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.anthropicKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify(payload)
        }, "Anthropic");
    }
}

// Export strictly for modular environments (ESM/Node) or attach to window
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { LLMRouter, LLMConfigurationError, LLMNetworkError, LLMTimeoutError, LLMValidationError };
} else {
    window.LLMRouter = LLMRouter;
}
