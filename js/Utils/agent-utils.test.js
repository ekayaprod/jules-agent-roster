/**
 * @jest-environment jsdom
 */

const AgentUtils = require('./agent-utils');

describe('AgentUtils', () => {
    describe('getPromptUrl', () => {
        // THE BOUNDARY INTERROGATION: Explicitly asserts a structural logic flaw (TypeError on null) without fixing the app code.
        it('crashes with TypeError when provided a null or undefined agent', () => {
            expect(() => AgentUtils.getPromptUrl(null)).toThrow(TypeError);
            expect(() => AgentUtils.getPromptUrl(undefined)).toThrow(TypeError);
        });
    });

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
             expect(AgentUtils).toHaveProperty('getCustomAgent');
             expect(AgentUtils).toHaveProperty('getFusionKey');
             expect(AgentUtils).toHaveProperty('splitFusionKey');
             expect(AgentUtils).toHaveProperty('getValidCustomAgents');
        });
    });

    describe('getFusionKey', () => {
        it('returns empty string if either name is missing', () => {
            expect(AgentUtils.getFusionKey(null, 'AgentB')).toBe('');
            expect(AgentUtils.getFusionKey('AgentA', undefined)).toBe('');
            expect(AgentUtils.getFusionKey('', '')).toBe('');
        });

        it('returns alphabetically sorted and comma-separated string', () => {
            expect(AgentUtils.getFusionKey('Zebra', 'Apple')).toBe('Apple,Zebra');
            expect(AgentUtils.getFusionKey('Apple', 'Zebra')).toBe('Apple,Zebra');
        });

        it('trims whitespace before sorting and joining', () => {
            expect(AgentUtils.getFusionKey('  Zebra  ', 'Apple')).toBe('Apple,Zebra');
            expect(AgentUtils.getFusionKey('Apple', '  Zebra  ')).toBe('Apple,Zebra');
        });
    });

    describe('splitFusionKey', () => {
        it('returns empty array if key is falsy', () => {
            expect(AgentUtils.splitFusionKey(null)).toEqual([]);
            expect(AgentUtils.splitFusionKey(undefined)).toEqual([]);
            expect(AgentUtils.splitFusionKey('')).toEqual([]);
        });

        it('returns an array of strings split by comma', () => {
            expect(AgentUtils.splitFusionKey('Apple,Zebra')).toEqual(['Apple', 'Zebra']);
        });

        it('trims whitespace from split parts', () => {
            expect(AgentUtils.splitFusionKey('  Apple  ,  Zebra  ')).toEqual(['Apple', 'Zebra']);
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

    it('exports gracefully across different environment module definitions', () => {
        const fs = require('fs');
        const code = fs.readFileSync('js/Utils/agent-utils.js', 'utf8');

        // Assert exports assign successfully in Node-like environment
        let isExported = false;
        let moduleMock = {
            get exports() { return {}; },
            set exports(val) { isExported = true; }
        };
        expect(() => {
            new Function('module', code)(moduleMock);
        }).not.toThrow();
        expect(isExported).toBe(true);

        // Assert safe bypass when module lacks exports property
        expect(() => {
            new Function('module', code)({});
        }).not.toThrow();

        // Assert safe bypass when module is strictly undefined (browser-like)
        expect(() => {
            new Function('module', code)(undefined);
        }).not.toThrow();
    });

describe('AgentUtils Boundary Interrogation: isCustom branch', () => {
    it('returns custom fusions path when agent is custom', () => {
        expect(AgentUtils.getPromptUrl({ name: 'FusionAgent', isCustom: true })).toBe('./prompts/fusions/FusionAgent.md');
    });

    it('returns standard path when agent is NOT custom', () => {
        expect(AgentUtils.getPromptUrl({ name: 'NormalAgent', isCustom: false })).toBe('./prompts/NormalAgent.md');
    });

    it('returns standard path when agent has neither isCustom nor promptFile', () => {
        expect(AgentUtils.getPromptUrl({ name: 'DefaultAgent' })).toBe('./prompts/DefaultAgent.md');
    });
});

describe('AgentUtils Boundary Interrogation: promptFile branch', () => {
    it('returns explicit promptFile when provided on agent', () => {
        expect(AgentUtils.getPromptUrl({ name: 'NormalAgent', promptFile: 'https://cdn.example.com/prompt.md' })).toBe('https://cdn.example.com/prompt.md');
    });
});

describe('AgentUtils Boundary Interrogation: getValidCustomAgents branch', () => {
    it('skips inherited prototype properties', () => {
        const mockAgents = Object.create({ inheritedProp: { name: 'Inherited', prompt: 'Prompt' } });
        mockAgents.ValidAgent = { name: 'Valid', prompt: 'Prompt' };
        const result = AgentUtils.getValidCustomAgents(mockAgents);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Valid');
    });
});
