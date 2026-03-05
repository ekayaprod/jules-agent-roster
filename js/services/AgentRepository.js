/**
 * Service class for fetching and validating agent data.
 * Handles the communication with the backend (file system) and ensures data integrity.
 */
class AgentRepository {
    constructor() {
        this.agents = [];
        this.customAgents = {};
    }

    /**
     * Fetches all agent data, including standard and custom agents.
     * @see ARCHITECTURE.md#1-system-context for the high-level data flow architecture.
     * @see ARCHITECTURE.md#2-component-architecture for the dependency graph.
     * @returns {Promise<{agents: Array, customAgents: Object}>} The loaded agents.
     * @throws {Error} If loading fails.
     */
    async fetchAgents() {
        try {
            // ⚡ Bolt+: Refactored sequential await calls into a concurrent Promise.all() to drastically reduce total network/I/O execution time on startup.
            const [agents, customAgents] = await Promise.all([
                this.#loadStandardAgents(),
                this.#loadCustomAgents()
            ]);

            this.agents = agents;
            this.customAgents = customAgents;

            return { agents: this.agents, customAgents: this.customAgents };
        } catch (error) {
            console.error("Failed to load agents.json", error);
            throw error;
        }
    }

    async #loadStandardAgents() {
        const response = await this.fetchWithRetry("agents.json");
        const rawData = await this.safeJsonParse(response, "agents.json");
        const agentsData = this.validateAgentsData(rawData);

        // Fetch Prompts for Standard Agents
        await Promise.all(
            agentsData.map(async (agent) => {
                agent.prompt = await this.fetchPrompt(
                    agent.name,
                    `prompts/${agent.name}.md`,
                    "Prompt missing.",
                );
            }),
        );

        return agentsData;
    }

    async #loadCustomAgents() {
        try {
            const customRes = await this.fetchWithRetry("custom_agents.json");
            if (!customRes.ok) return {};

            const rawCustomData = await this.safeJsonParse(
                customRes,
                "custom_agents.json",
            );

            const validatedCustomData = {};

            await Promise.all(
                Object.entries(rawCustomData).map(async ([key, custom]) => {
                    const agent = await this.#processCustomAgent(key, custom);
                    if (agent) {
                        validatedCustomData[key] = agent;
                    }
                }),
            );

            return validatedCustomData;
        } catch (e) {
            if (e.message.includes("parse JSON")) {
                console.error(
                    "CRITICAL: custom_agents.json is malformed. Fusion data may be incomplete.",
                    e,
                );
            } else {
                console.warn(
                    "custom_agents.json not loaded (missing or network error).",
                );
            }
            return {};
        }
    }

    async #processCustomAgent(key, custom) {
        try {
            const validation = this.validateCustomAgent(key, custom);

            if (!validation.valid) {
                // TELEMETRY: Log rejection
                console.warn(
                    JSON.stringify({
                        event: "INVALID_CUSTOM_AGENT",
                        key: key,
                        reason: validation.reason,
                        timestamp: new Date().toISOString(),
                    }),
                );
                return null;
            }

            const agent = validation.sanitized;

            // Sanitize name for filename: Remove non-ASCII, trim.
            const cleanName = agent.name
                .replace(/[^\x00-\x7F]/g, "")
                .trim();
            const filename = `prompts/fusions/${cleanName}.md`;

            agent.prompt = await this.fetchPrompt(
                agent.name,
                filename,
                null,
            );

            return agent;
        } catch (err) {
            console.error(`Error processing custom agent '${key}':`, err);
            return null;
        }
    }

    /**
     * Safely fetches a prompt file, handling parsing and default fallbacks.
     * @param {string} name - The agent name for logging.
     * @param {string} url - The URL to fetch the prompt from.
     * @param {string|null} fallback - The fallback value if fetching fails.
     * @returns {Promise<string|null>} The parsed prompt or the fallback value.
     */
    async fetchPrompt(name, url, fallback) {
        try {
            const res = await this.fetchWithRetry(url);
            if (!res.ok) {
                if (!url.includes("fusions")) {
                    console.warn(`Failed to load prompt for ${name}`);
                }
                return fallback;
            }
            return await res.text();
        } catch (e) {
            console.warn(
                url.includes("fusions")
                    ? `Error loading custom prompt for ${name}`
                    : `Error loading prompt for ${name}`,
                e
            );
            return fallback;
        }
    }

    /**
     * Fetches a resource with exponential backoff retry logic.
     * @param {string} url - The URL to fetch.
     * @param {RequestInit} [options={}] - Fetch options.
     * @param {number} [retries=3] - Number of retries.
     * @param {number} [backoff=300] - Initial backoff delay in ms.
     * @returns {Promise<Response>} The fetch response.
     * @throws {Error} If all retries fail.
     */
    async fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Paramedic: Do not retry 404s, they are likely permanent
                if (response.status === 404) {
                    return response;
                }
                throw new Error("We couldn't reach the server. Please check your internet connection and try again.");
            }
            return response;
        } catch (error) {
            if (retries > 0) {
                console.warn(`Retrying ${url} (${retries} left)...`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                return this.fetchWithRetry(
                    url,
                    options,
                    retries - 1,
                    backoff * 2,
                );
            }
            throw error;
        }
    }

    /**
     * Safely parses JSON from a fetch response, adding context to errors.
     * Captures raw response errors and decorates them with human-readable context
     * to prevent silent failures when loading external configuration.
     * @see ARCHITECTURE.md#6-data-integrity--parsing
     * @param {Response} response - The fetch response object.
     * @param {string} label - A label for the resource (e.g., "agents.json").
     * @returns {Promise<Object|Array>} The parsed JSON data.
     * @throws {Error} If parsing fails, with a descriptive message.
     */
    async safeJsonParse(response, label) {
        try {
            return await response.json();
        } catch (error) {
            console.error(JSON.stringify({
                event: 'JSON_PARSE_FAILED',
                resource: label,
                error: error.message
            }));
            throw new Error("Check the configuration file formatting and try again.");
        }
    }

    /**
     * Validates the structure of the agents data and sanitizes optional fields.
     * Filters out agents that do not match the expected schema (name, category, promptFile).
     * Ensures optional fields like `scope` are of the correct type,
     * defaulting to safe values if invalid.
     *
     * @param {unknown} data - The raw JSON data to validate.
     * @returns {Array<Object>} Array of valid, sanitized agent objects.
     * @throws {Error} If the input data is not an array.
     */
    validateAgentsData(data) {
        if (!Array.isArray(data)) {
            throw new Error("Provide a valid list of agents in the expected format.");
        }
        return data
            .filter((agent) => {
                const isValid =
                    agent &&
                    typeof agent.name === "string" &&
                    typeof agent.category === "string" &&
                    Object.keys(CONFIG.categories).includes(agent.category);

                if (!isValid) {
                    console.warn("Skipping invalid agent entry:", agent);
                }
                return isValid;
            })
            .map((agent) => {
                // Pedant: Ensure name is trimmed to prevent matching issues
                if (agent.name) {
                    agent.name = agent.name.trim();
                }

                // Paramedic: Sanitize optional fields to prevent fragility
                if (agent.scope && typeof agent.scope !== "string") {
                    console.warn(
                        `Sanitizing agent ${agent.name}: scope must be string. Casting.`,
                    );
                    agent.scope = String(agent.scope);
                }

                return agent;
            });
    }

    /**
     * The First Responder: Validates and sanitizes a custom agent entry.
     * Enforces strict schema and sanitizes optional fields.
     * Implements defense-in-depth by running a robust malicious pattern regex
     * on all custom agent data before it enters the application state.
     * @see ARCHITECTURE.md#4-trust-boundaries
     * @see ARCHITECTURE.md#7-security-model
     * @param {string} key - The dictionary key (agent ingredients).
     * @param {Object} data - The raw agent data.
     * @returns {Object} { valid: boolean, sanitized?: Object, reason?: string }
     */
    validateCustomAgent(key, data) {
        if (!data || typeof data !== "object") {
            return { valid: false, reason: "Entry is not an object" };
        }
        // Critical: Name is required
        if (
            !data.name ||
            typeof data.name !== "string" ||
            data.name.trim() === ""
        ) {
            return { valid: false, reason: "Missing or invalid 'name' field" };
        }

        // First Responder: Sanitize optional fields
        // If description exists but is not a string, cast it.
        if (data.desc !== undefined && typeof data.desc !== "string") {
            data.desc = String(data.desc);
        }
        if (data.description !== undefined && typeof data.description !== "string") {
            data.description = String(data.description);
        }
        if (data.short_description !== undefined && typeof data.short_description !== "string") {
            console.warn(`[First Responder] Sanitizing ${key}: short_description must be string. Casting.`);
            data.short_description = String(data.short_description);
        }

        // Security: Check for XSS in name/description using a robust pattern
        // Targets dangerous tags, event handlers, and URI schemes.
        const maliciousPattern = /<\s*(script|iframe|object|embed|style|meta|link|base|svg|math|form|details|button|video|audio|canvas|map|area|plaintext|basefont|listing|xmp)\b|on\w+\s*=|javascript\s*:|vbscript\s*:/i;
        if (
            maliciousPattern.test(data.name) ||
            (data.short_description && maliciousPattern.test(data.short_description)) ||
            (data.desc && maliciousPattern.test(data.desc)) ||
            (data.description && maliciousPattern.test(data.description))
        ) {
            return { valid: false, reason: "Potential malicious content detected" };
        }

        // Standardize schema to match agents.json (desc, icon, clean name)
        // Standardize schema
        if (data.description !== undefined && data.short_description === undefined) {
            data.short_description = data.description;
            delete data.description;
        }
        if (data.desc !== undefined && data.short_description === undefined) {
            data.short_description = data.desc;
            delete data.desc;
        }

        if (typeof StringUtils !== 'undefined') {
            if (!data.emoji) {
                data.emoji = StringUtils.hasEmojiSuffix(data.name)
                    ? StringUtils.extractEmoji(data.name)
                    : (StringUtils.hasEmojiPrefix(data.name)
                        ? StringUtils.extractEmojiPrefix(data.name)
                        : '🤖');
            }
            if (StringUtils.hasEmojiSuffix(data.name)) {
                data.name = StringUtils.extractNameWithoutEmoji(data.name);
            } else if (StringUtils.hasEmojiPrefix(data.name)) {
                data.name = StringUtils.extractNameWithoutEmojiPrefix(data.name);
            }
        } else {
            // Safe fallback defaults to avoid duplicating complex logic
            if (!data.emoji) {
                data.emoji = '🤖';
            }
            // Retain original name if utility is inexplicably missing
        }

        return { valid: true, sanitized: data };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentRepository;
}
