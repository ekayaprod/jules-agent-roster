/**
 * @jest-environment jsdom
 */

const PromptParser = require('./prompt-parser');

describe('PromptParser Inspector Polygraph', () => {
    describe('parsePrompt telemetry fallback global branch', () => {
        let originalDOMParser;
        let originalTelemetryUtils;

        beforeAll(() => {
            originalDOMParser = global.DOMParser;
            originalTelemetryUtils = global.TelemetryUtils;
        });

        afterAll(() => {
            global.DOMParser = originalDOMParser;
            global.TelemetryUtils = originalTelemetryUtils;
        });

        it('should execute telemetry branch where telemetry is null', () => {
            // Force DOMParser to throw
            global.DOMParser = jest.fn().mockImplementation(() => {
                throw new Error("Simulated parse error");
            });

            // Null out TelemetryUtils
            global.TelemetryUtils = null;
            if (typeof window !== 'undefined') window.TelemetryUtils = null;

            const result = PromptParser.parsePrompt("<system>fail</system>");
            expect(result.format).toBe('legacy');
        });
    });
});
