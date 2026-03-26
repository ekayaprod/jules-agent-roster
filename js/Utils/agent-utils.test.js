/**
 * @jest-environment jsdom
 */

const AgentUtils = require('./agent-utils');

describe('AgentUtils', () => {
    describe('getCustomAgent', () => {
        it('returns undefined if customAgents is falsy', () => {
            expect(AgentUtils.getCustomAgent(null, 'test')).toBeUndefined();
            expect(AgentUtils.getCustomAgent(undefined, 'test')).toBeUndefined();
        });

        it('returns the agent if it exists in the dictionary', () => {
            const mockAgents = { 'AgentA': { name: 'Agent A' } };
            expect(AgentUtils.getCustomAgent(mockAgents, 'AgentA')).toEqual({ name: 'Agent A' });
        });

        it('returns undefined if the key does not exist', () => {
            const mockAgents = { 'AgentA': { name: 'Agent A' } };
            expect(AgentUtils.getCustomAgent(mockAgents, 'AgentB')).toBeUndefined();
        });

        it('handles complex nested object returns properly', () => {
            const mockAgents = { 'TestKey': { nested: { val: 42 } } };
            expect(AgentUtils.getCustomAgent(mockAgents, 'TestKey').nested.val).toBe(42);
        });

        // Sabotage Check & Additional coverage for AgentUtils environment block
        it('should correctly export when module is available', () => {
             // Already covered via module.exports usage
             expect(AgentUtils).toBeDefined();
        });
    });

    describe('getValidCustomAgents', () => {
        it('returns empty array if customAgents is falsy or empty', () => {
            expect(AgentUtils.getValidCustomAgents(null)).toEqual([]);
            expect(AgentUtils.getValidCustomAgents(undefined)).toEqual([]);
            expect(AgentUtils.getValidCustomAgents({})).toEqual([]);
        });

        it('returns only agents with valid non-empty prompt property', () => {
            const mockAgents = {
                'AgentA': { name: 'Agent A', prompt: 'Prompt A' },
                'AgentB': { name: 'Agent B', prompt: '' },
                'AgentC': { name: 'Agent C' },
                'AgentD': { name: 'Agent D', prompt: 'Prompt D' }
            };

            const result = AgentUtils.getValidCustomAgents(mockAgents);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { name: 'Agent A', prompt: 'Prompt A' },
                { name: 'Agent D', prompt: 'Prompt D' }
            ]);
        });
    });
});
