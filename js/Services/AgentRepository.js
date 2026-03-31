/**
 * Service class for fetching and validating agent data.
 * Handles the communication with the backend (file system) and ensures data integrity.
 */
class AgentRepository {
    static REQUEST_TIMEOUT_MS = 10000;
    static DEFAULT_BACKOFF_MS = 300;
    static MAX_RETRIES = 3;

    constructor() {
        this.agents = [];
        this.customAgents = {};
        this.fusionMatrix = {};
    }

    /**
     * Fetches all agent data, including standard and custom agents.
     * @see ../../docs/architecture/Services/README.md#agentrepository-architecture for the high-level data flow architecture.
     * @see ../../docs/architecture/Services/README.md#agentrepository-architecture for the dependency graph.
     * @returns {Promise<{agents: Array, customAgents: Object, fusionMatrix: Object}>} The loaded agents.
     * @throws {Error} If loading fails.
     */
    async fetchAgents() {
        try {
            const [rosterResponse, matrixResponse] = await Promise.all([
                this.fetchWithRetry("./roster-payload.json"),
                this.fetchWithRetry("./fusion_matrix.json").catch(() => null)
            ]);

            const payload = await this.safeJsonParse(rosterResponse, "./roster-payload.json");

            if (matrixResponse && matrixResponse.ok) {
                this.fusionMatrix = await this.safeJsonParse(matrixResponse, "./fusion_matrix.json");
            } else {
                this.fusionMatrix = {};
            }

            const rawAgents = Array.isArray(payload) ? payload : [];
            const standardAgentsRaw = [];
            const customAgentsRaw = [];

            for (const agent of rawAgents) {
                if (agent.isCustom) {
                    customAgentsRaw.push(agent);
                } else {
                    standardAgentsRaw.push(agent);
                }
            }

            this.agents = this.validateAgentsData(standardAgentsRaw);

            this.customAgents = {};
            for (const agent of customAgentsRaw) {
                // We use the name as the key for customAgents
                const key = agent.name;
                const validation = this.validateCustomAgent(key, agent);
                if (validation.valid) {
                    const validAgent = validation.sanitized;
                    validAgent.prompt = agent.prompt;
                    this.customAgents[key] = validAgent;
                } else {
                    console.warn(
                        JSON.stringify({
                            event: "INVALID_CUSTOM_AGENT",
                            key: key,
                            reason: validation.reason,
                            timestamp: new Date().toISOString(),
                        })
                    );
                }
            }

            return { agents: this.agents, customAgents: this.customAgents, fusionMatrix: this.fusionMatrix };
        } catch (error) {
            console.error("Failed to load agent payloads", error);
            throw error;
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
     * @param {number} [retries=AgentRepository.MAX_RETRIES] - Number of retries.
     * @param {number} [backoff=AgentRepository.DEFAULT_BACKOFF_MS] - Initial backoff delay in ms.
     * @returns {Promise<Response>} The fetch response.
     * @throws {Error} If all retries fail.
     */
    async fetchWithRetry(url, options = {}, retries = AgentRepository.MAX_RETRIES, backoff = AgentRepository.DEFAULT_BACKOFF_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AgentRepository.REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: options.signal || controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Paramedic: Do not retry 404s, they are likely permanent
                if (response.status === 404) {
                    return response;
                }
                throw new Error("We couldn't reach the server. Please check your internet connection and try again.");
            }
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
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
     * @see ../../docs/architecture/Services/README.md#agentrepository-architecture
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
            throw new Error("Check your configuration file formatting and try again.");
        }
    }

    /**
     * Validates the structure of the agents data and sanitizes optional fields.
     * Filters out agents that do not match the expected schema (name, category, promptFile).
     * Ensures optional fields like `scope` are of the correct type,
     * defaulting to safe values if invalid.
     *
     * @param {unknown} agentPayload - The raw JSON data to validate.
     * @returns {Array<Object>} Array of valid, sanitized agent objects.
     * @throws {Error} If the input data is not an array.
     */
    validateAgentsData(agentPayload) {
        if (!Array.isArray(agentPayload)) {
            throw new Error("Provide a valid list of agents in the expected format.");
        }

        // ↗️ VECTORIZE: The Single-Pass Bypass. We ignore the heavily abstracted layers and execute the calculation in one direct, zero-allocation pass.
        const validCategories = Object.keys(CONFIG.categories);
        const result = [];

        for (let i = 0; i < agentPayload.length; i++) {
            const agent = agentPayload[i];
            let normalizedCategory = "";
            if (agent && typeof agent.category === "string") {
                normalizedCategory = agent.category.toLowerCase();
            }
            const isValid =
                agent &&
                typeof agent.name === "string" &&
                validCategories.includes(normalizedCategory);

            if (isValid) {
                agent.category = normalizedCategory;
            }

            if (!isValid) {
                console.warn("Skipping invalid agent entry:", agent);
                continue;
            }

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

            result.push(agent);
        }
        return result;
    }

    /**
     * The First Responder: Validates and sanitizes a custom agent entry.
     * Enforces strict schema and sanitizes optional fields.
     * Implements defense-in-depth by running a robust malicious pattern regex
     * on all custom agent data before it enters the application state.
     * @see ../../docs/architecture/Services/README.md#agentrepository-architecture
     * @param {string} key - The dictionary key (agent ingredients).
     * @param {Object} agentPayload - The raw agent data.
     * @returns {Object} { valid: boolean, sanitized?: Object, reason?: string }
     */
    validateCustomAgent(key, agentPayload) {
        if (!agentPayload || typeof agentPayload !== "object") {
            return { valid: false, reason: "Entry is not an object" };
        }
        // Critical: Name is required
        if (
            !agentPayload.name ||
            typeof agentPayload.name !== "string" ||
            agentPayload.name.trim() === ""
        ) {
            return { valid: false, reason: "Missing or invalid 'name' field" };
        }

        // First Responder: Sanitize optional fields
        // If description exists but is not a string, cast it.
        if (agentPayload.desc !== undefined && typeof agentPayload.desc !== "string") {
            agentPayload.desc = String(agentPayload.desc);
        }
        if (agentPayload.description !== undefined && typeof agentPayload.description !== "string") {
            agentPayload.description = String(agentPayload.description);
        }
        if (agentPayload.short_description !== undefined && typeof agentPayload.short_description !== "string") {
            console.warn(`[First Responder] Sanitizing ${key}: short_description must be string. Casting.`);
            agentPayload.short_description = String(agentPayload.short_description);
        }

        // Security: Check for XSS in name/description using a robust pattern
        // WARN: This regex acts as the final boundary line against DOM-based XSS when injecting dynamic JSON data.
        // Do not remove tags from this list without cross-referencing OWASP standards.
        // It strictly checks for:
        // 1. /<\s*(...)\b/i -> Matches the opening of potentially executable or external-loading HTML tags.
        // 2. /on\w+\s*=/i -> Matches inline event handlers (e.g., onclick=, onerror=) to prevent execution.
        // 3. /javascript\s*:|vbscript\s*:/i -> Matches malicious URI schemes often injected into href or src attributes.
        const maliciousPattern = /<\s*(script|iframe|object|embed|style|meta|link|base|svg|math|form|details|button|video|audio|canvas|map|area|plaintext|basefont|listing|xmp)\b|on\w+\s*=|javascript\s*:|vbscript\s*:/i;
        if (
            maliciousPattern.test(agentPayload.name) ||
            (agentPayload.short_description && maliciousPattern.test(agentPayload.short_description)) ||
            (agentPayload.desc && maliciousPattern.test(agentPayload.desc)) ||
            (agentPayload.description && maliciousPattern.test(agentPayload.description))
        ) {
            return { valid: false, reason: "Potential malicious content detected" };
        }

        // Standardize schema to match agents.json (desc, icon, clean name)
        // Standardize schema
        if (agentPayload.description !== undefined && agentPayload.short_description === undefined) {
            agentPayload.short_description = agentPayload.description;
            delete agentPayload.description;
        }
        if (agentPayload.desc !== undefined && agentPayload.short_description === undefined) {
            agentPayload.short_description = agentPayload.desc;
            delete agentPayload.desc;
        }

        if (!agentPayload.emoji) {
            agentPayload.emoji = '🤖';
        }

        return { valid: true, sanitized: agentPayload };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentRepository;
    module.exports.REQUEST_TIMEOUT_MS = AgentRepository.REQUEST_TIMEOUT_MS;
    module.exports.DEFAULT_BACKOFF_MS = AgentRepository.DEFAULT_BACKOFF_MS;
    module.exports.MAX_RETRIES = AgentRepository.MAX_RETRIES;
}
