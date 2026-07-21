/**
 * @jest-environment jsdom
 */

const AgentUtils = require('./agent-utils');

describe('AgentUtils Boundary Stress-Tests', () => {
    describe('getFusionKey', () => {
        it('should safely process integer inputs without throwing', () => {
            expect(AgentUtils.getFusionKey(123, 456)).toBe('123,456');
        });
    });

    describe('splitFusionKey', () => {
        it('should safely process integer inputs without throwing', () => {
            expect(AgentUtils.splitFusionKey(12345)).toEqual(['12345']);
        });
    });
});
