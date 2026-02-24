/**
 * FusionSchema
 * Defines the strict contract for Fusion Agent outputs.
 * Provides validation logic to ensure LLM responses match the expected structure.
 */
const FusionSchema = {
    /**
     * Validates a raw JSON string or object against the Fusion Schema.
     * @param {string|Object} input - The JSON string or object to validate.
     * @returns {Object} { valid: boolean, errors: string[], data?: Object }
     */
    validate(input) {
        let data = input;
        const errors = [];

        // 1. Parse JSON if string
        if (typeof input === 'string') {
            try {
                data = JSON.parse(input);
            } catch (e) {
                return { valid: false, errors: [`JSON Parse Error: ${e.message}`] };
            }
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return { valid: false, errors: ["Root must be an object."] };
        }

        // 2. Validate Structure
        const requiredKeys = ['phase1', 'phase2', 'pr_title'];
        const allowedKeys = new Set(requiredKeys);

        // Check for missing keys
        requiredKeys.forEach(key => {
            if (!(key in data)) {
                errors.push(`Missing required key: '${key}'.`);
            }
        });

        // Check for extra keys (Strict Mode)
        Object.keys(data).forEach(key => {
            if (!allowedKeys.has(key)) {
                errors.push(`Unexpected key found: '${key}'. Schema allows only: ${requiredKeys.join(', ')}.`);
            }
        });

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        // 3. Validate Types & Nested Objects
        // Phase 1
        if (typeof data.phase1 !== 'object' || data.phase1 === null || Array.isArray(data.phase1)) {
             errors.push("'phase1' must be an object.");
        } else {
            if (typeof data.phase1.thought_process !== 'string') errors.push("'phase1.thought_process' must be a string.");
            if (typeof data.phase1.output !== 'string') errors.push("'phase1.output' must be a string.");
        }

        // Phase 2
        if (typeof data.phase2 !== 'object' || data.phase2 === null || Array.isArray(data.phase2)) {
             errors.push("'phase2' must be an object.");
        } else {
            if (typeof data.phase2.thought_process !== 'string') errors.push("'phase2.thought_process' must be a string.");
            if (typeof data.phase2.output !== 'string') errors.push("'phase2.output' must be a string.");
        }

        // PR Title
        if (typeof data.pr_title !== 'string') {
            errors.push("'pr_title' must be a string.");
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true, data };
    },

    /**
     * Safely parses and validates input, throwing an error if invalid.
     * useful for fail-fast scenarios.
     * @param {string|Object} input
     * @returns {Object} The valid data object.
     * @throws {Error} If validation fails.
     */
    parse(input) {
        const result = this.validate(input);
        if (!result.valid) {
            throw new Error(`FusionSchema Validation Failed:\n- ${result.errors.join('\n- ')}`);
        }
        return result.data;
    }
};

// Node.js Export Support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FusionSchema;
}
