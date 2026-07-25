/**
 * @jest-environment jsdom
 */

const PromptParser = require('./prompt-parser');
const TelemetryUtils = require('../telemetry/telemetry-utils');

describe('PromptParser Boundary Stress-Tests', () => {
    describe('stripFrontmatter', () => {
        it('should safely process integer inputs without throwing', () => {
            expect(PromptParser.stripFrontmatter(12345)).toBe(12345);
        });
    });

    describe('parsePrompt Catch Block', () => {
        it('should dispatch telemetry event on DOMParser failure', () => {
            const dispatchSpy = jest.spyOn(TelemetryUtils, 'dispatchEvent');
            const originalDOMParser = global.DOMParser;

            global.DOMParser = class {
                parseFromString() {
                    throw new Error('Mock DOMParser Error');
                }
            };

            const result = PromptParser.parsePrompt('<system>test</system>');

            expect(dispatchSpy).toHaveBeenCalledWith(
                'PROMPT_PARSE_FAILED',
                expect.any(Error),
                { input: '<system>test</system>' }
            );
            expect(result).toEqual({ format: 'legacy', raw: '<system>test</system>' });

            global.DOMParser = originalDOMParser;
            dispatchSpy.mockRestore();
        });
    });
});
