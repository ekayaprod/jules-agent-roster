/**
 * @jest-environment jsdom
 */

const AgentUtils = require('./agent-utils');

describe('AgentUtils Boundary Stress-Tests', () => {
    describe('getFusionKey', () => {
        it('throws an error when inputs are integers, exposing missing type-safety', () => {
            expect(() => {
                AgentUtils.getFusionKey(123, 456);
            }).toThrow(TypeError);
        });
    });

    describe('splitFusionKey', () => {
        it('throws an error when input is an integer, exposing missing type-safety', () => {
            expect(() => {
                AgentUtils.splitFusionKey(12345);
            }).toThrow(TypeError);
        });
    });
});
