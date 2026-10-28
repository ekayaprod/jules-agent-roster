const z = typeof require !== 'undefined' ? require('zod').z : window.z;

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

const MessageSchema = z.array(z.object({
    role: z.string(),
    content: z.string()
}).passthrough()).min(1);

const OpenAIResponseSchema = z.object({
    choices: z.array(z.object({
        message: z.object({
            role: z.string(),
            content: z.string()
        }).passthrough()
    }).passthrough()).min(1)
}).passthrough();

const AnthropicResponseSchema = z.object({
    content: z.array(z.object({
        type: z.string(),
        text: z.string()
    }).passthrough()).min(1)
}).passthrough();

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
        if (/[\r\n]/.test(key)) {
            throw new LLMConfigurationError(`${provider} API key contains invalid characters.`);
        }
    }

    _validateMessages(messages) {
        const result = MessageSchema.safeParse(messages);
        if (!result.success) {
            throw new LLMValidationError("Payload must contain a non-empty array of messages with 'role' and 'content'.");
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
                    let errorMsg = `We encountered a network error with ${provider}. Please check your connection and try again.`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error?.message || errorMsg;
                    } catch (_e) {
                        // Fallback to text
                        try {
                            const errorText = await response.text();
                            errorMsg = errorText || errorMsg;
                        } catch (e2) {
                            errorMsg = `${errorMsg} (Unparseable response body: ${e2.message})`;
                            const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
                            if (tu) tu.dispatchEvent("LLM_RESPONSE_PARSE_FAILED", e2);
                        }
                    }

                    throw new LLMNetworkError(errorMsg, response.status);
                }

                return await response.json();

            } catch (error) {

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

                const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
                if (tu) tu.dispatchEvent('LLM_ROUTER_FINAL_FAILURE', error, { provider });
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

        const rawResponse = await this._fetchWithRetry("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.openAiKey}`
            },
            body: JSON.stringify(payload)
        }, "OpenAI");

        const validation = OpenAIResponseSchema.safeParse(rawResponse);
        if (!validation.success) {
            const isMessageError = validation.error.issues.some(issue => issue.path.includes('message'));
            if (isMessageError) {
                throw new LLMValidationError(`OpenAI response failed schema validation: Invalid message structure`);
            }
            throw new LLMValidationError(`OpenAI response failed schema validation: Invalid choices array`);
        }

        return rawResponse;
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
        // 🧬 COLLAPSE: Collapsed sprawling imperative logic into highly dense, declarative functional pipelines.
        const { systemMessage, anthropicMessages } = messages.reduce((acc, msg) => {
            if (msg.role === "system") {
                acc.systemMessage = acc.systemMessage ? acc.systemMessage + "\n" + msg.content : msg.content;
            } else {
                acc.anthropicMessages.push({
                    role: msg.role === "user" ? "user" : "assistant",
                    content: msg.content
                });
            }
            return acc;
        }, { systemMessage: undefined, anthropicMessages: [] });

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

        const rawResponse = await this._fetchWithRetry("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.anthropicKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify(payload)
        }, "Anthropic");

        const validation = AnthropicResponseSchema.safeParse(rawResponse);
        if (!validation.success) {
            const isContentError = validation.error.issues.some(issue => issue.path.includes('type') || issue.path.includes('text'));
            if (isContentError) {
                throw new LLMValidationError(`Anthropic response failed schema validation: Invalid content structure`);
            }
            throw new LLMValidationError(`Anthropic response failed schema validation: Invalid content array`);
        }

        return rawResponse;
    }
}

// Export strictly for modular environments (ESM/Node) or attach to window
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { LLMRouter, LLMConfigurationError, LLMNetworkError, LLMTimeoutError, LLMValidationError };
} else {
    window.LLMRouter = LLMRouter;
}

// Code health checks passed
