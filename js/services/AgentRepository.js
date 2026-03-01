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
     * @returns {Promise<{agents: Array, customAgents: Object}>} The loaded agents.
     * @throws {Error} If loading fails.
     */
    async getAgents() {
        try {
            const response = await this.fetchWithRetry("agents.json");
            const rawData = await this.safeJsonParse(response, "agents.json");
            const agentsData = this.validateAgentsData(rawData);

            // Fetch Prompts for Standard Agents
            await Promise.all(
                agentsData.map(async (agent) => {
                    try {
                        const promptRes = await this.fetchWithRetry(`prompts/${agent.name}.md`);
                        if (promptRes.ok) {
                            agent.prompt = await promptRes.text();
                        } else {
                            console.warn(`Failed to load prompt for ${agent.name}`);
                            agent.prompt = "Prompt missing.";
                        }
                    } catch (e) {
                        console.warn(`Error loading prompt for ${agent.name}`, e);
                        agent.prompt = "Prompt missing.";
                    }
                }),
            );

            this.agents = agentsData;

            // FUSION: Load Custom Agents Data
            let customAgentsData = {};
            try {
                const customRes = await this.fetchWithRetry("custom_agents.json");
                if (customRes.ok) {
                    const rawCustomData = await this.safeJsonParse(
                        customRes,
                        "custom_agents.json",
                    );

                    // The First Responder: Validate & Sanitize Boundary
                    const validatedCustomData = {};

                    await Promise.all(
                        Object.entries(rawCustomData).map(async ([key, custom]) => {
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
                                    return; // Skip this agent
                                }

                                const agent = validation.sanitized;

                                // Sanitize name for filename: Remove non-ASCII, trim.
                                const cleanName = agent.name
                                    .replace(/[^\x00-\x7F]/g, "")
                                    .trim();
                                const filename = `prompts/fusions/${cleanName}.md`;

                                try {
                                    const promptRes = await this.fetchWithRetry(filename);
                                    if (promptRes.ok) {
                                        agent.prompt = await promptRes.text();
                                    } else {
                                        // File not found -> Assume dynamic fusion (like "The Void")
                                        agent.prompt = null;
                                    }
                                } catch (e) {
                                    console.warn(
                                        `Error loading custom prompt for ${agent.name}`,
                                        e,
                                    );
                                    agent.prompt = null;
                                }

                                // Add to valid set
                                validatedCustomData[key] = agent;
                            } catch (err) {
                                // Catch-all for unexpected processing errors to prevent total crash
                                console.error(
                                    JSON.stringify({
                                        event: "CUSTOM_AGENT_PROCESSING_ERROR",
                                        key: key,
                                        error: err.message,
                                    }),
                                );
                            }
                        }),
                    );

                    customAgentsData = validatedCustomData;
                }
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
            }

            this.customAgents = customAgentsData;
            return { agents: this.agents, customAgents: this.customAgents };

        } catch (error) {
            console.error("Failed to load agents.json", error);
            throw error;
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
                // Medic: Do not retry 404s, they are likely permanent
                if (response.status === 404) {
                    return response;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
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
     * @param {Response} response - The fetch response object.
     * @param {string} label - A label for the resource (e.g., "agents.json").
     * @returns {Promise<any>} The parsed JSON data.
     * @throws {Error} If parsing fails, with a descriptive message.
     */
    async safeJsonParse(response, label) {
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to parse JSON for ${label}: ${error.message}`);
        }
    }

    /**
     * Validates the structure of the agents data and sanitizes optional fields.
     * Filters out agents that do not match the expected schema (name, category, promptFile).
     * Ensures optional fields like `scope` are of the correct type,
     * defaulting to safe values if invalid.
     *
     * @param {any} data - The raw JSON data to validate.
     * @returns {Array<Object>} Array of valid, sanitized agent objects.
     * @throws {Error} If the input data is not an array.
     */
    validateAgentsData(data) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid format: agents data must be an array.");
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

                // Medic: Sanitize optional fields to prevent fragility
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
        if (
            data.description !== undefined &&
            typeof data.description !== "string"
        ) {
            console.warn(
                `[First Responder] Sanitizing ${key}: description must be string. Casting.`,
            );
            data.description = String(data.description);
        }

        // Security: Check for basic XSS in name/description
        const maliciousPattern = /<script|javascript:/i;
        if (
            maliciousPattern.test(data.name) ||
            (data.description && maliciousPattern.test(data.description))
        ) {
            return { valid: false, reason: "Potential malicious content detected" };
        }

        return { valid: true, sanitized: data };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentRepository;
}
