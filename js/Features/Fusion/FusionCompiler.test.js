const { PromptParser } = require('../../Utils');
global.PromptParser = PromptParser;
const { FusionCompiler } = require('./index');

describe('FusionCompiler', () => {
  let compiler;
  const mockBaseAgents = [
    { name: 'Architect', emoji: '📐', prompt: '## BOUNDARIES\nArch Bound\n## PROCESS\nArch Proc' },
    { name: 'Helix', emoji: '🧬', prompt: '## BOUNDARIES\nHelix Bound\n## PROCESS\nHelix Proc' },
    { name: 'Janitor', emoji: '🧹', prompt: '## BOUNDARIES\nJanitor Bound\n## PROCESS\nJanitor Proc' },
    { name: 'MonthlyAgent', emoji: '📅', category: 'monthly', prompt: '' },
    { name: 'PowerAgent', emoji: '🔋', category: 'power', prompt: '' },
    { name: 'Unknown', emoji: '❓', prompt: 'Unknown Prompt' },
    { name: 'Spark', emoji: '✨', prompt: '' }
  ];

  const mockCustomAgents = {
    'Architect,Helix': { name: 'The Void', prompt: null, short_description: 'Custom Void' },
    'Helix, Janitor': { name: 'Clean Code', prompt: 'Custom Prompt Here', desc: 'Custom Desc' }
  };

  beforeEach(() => {
    compiler = new FusionCompiler(mockBaseAgents, mockCustomAgents);
  });

  describe('constructor', () => {
    it('filters out monthly and power agents', () => {
      expect(compiler.baseAgents.length).toBe(4); // Spark should be filtered out
      expect(compiler.baseAgents.find(a => a.name === 'MonthlyAgent')).toBeUndefined();
      expect(compiler.baseAgents.find(a => a.name === 'Spark')).toBeUndefined();
    });

    it('handles undefined agentsData gracefully', () => {
      const c = new FusionCompiler(undefined, null);
      expect(c.baseAgents).toEqual([]);
    });

    it('normalizes custom agents keys by trimming and sorting', () => {
      expect(compiler.customAgentsMap['Architect,Helix']).toBeDefined();
      expect(compiler.customAgentsMap['Helix,Janitor']).toBeDefined();
    });

    it('handles null/undefined customAgents gracefully', () => {
      const c = new FusionCompiler([], null);
      expect(c.customAgentsMap).toEqual({});
    });
  });

  describe('extractSection', () => {
    it('returns fallback if prompt is missing or not a string', () => {
      expect(compiler.extractSection(null, 'BOUNDARIES')).toBe('Prompt data missing.');
      expect(compiler.extractSection(123, 'BOUNDARIES')).toBe('Prompt data missing.');
    });

    it('extracts content between header and next header', () => {
      const prompt = '## BOUNDARIES\nThis is a boundary.\n## PROCESS\nThis is a process.';
      expect(compiler.extractSection(prompt, 'BOUNDARIES')).toBe('This is a boundary.');
    });

    it('extracts content between header and end of string', () => {
      const prompt = '## PROCESS\nThis is a process.\nIt spans lines.';
      expect(compiler.extractSection(prompt, 'PROCESS')).toBe('This is a process.\nIt spans lines.');
    });

    it('returns fallback if header is not found', () => {
      const prompt = '## OTHER\nSome content';
      expect(compiler.extractSection(prompt, 'BOUNDARIES')).toBe('Section extraction failed. Follow standard constraints.');
    });

    it('escapes regex characters in header name', () => {
      const prompt = '## C++\nPlus plus\n## OTHER';
      expect(compiler.extractSection(prompt, 'C++')).toBe('Plus plus');
    });
  });

  describe('extractAgentContent', () => {
    it('returns fallbacks if prompt is missing', () => {
      expect(compiler.extractAgentContent('')).toEqual({ boundaries: 'Missing prompt.', process: 'Missing prompt.' });
      expect(compiler.extractAgentContent(null)).toEqual({ boundaries: 'Missing prompt.', process: 'Missing prompt.' });
    });

    it('uses legacy markdown extraction if PromptParser is undefined', () => {
      const originalPromptParser = global.PromptParser;
      global.PromptParser = undefined;
      const prompt = '## BOUNDARIES\nBnd\n## PROCESS\nPrc';
      expect(compiler.extractAgentContent(prompt)).toEqual({ boundaries: 'Bnd', process: 'Prc' });
      global.PromptParser = originalPromptParser;
    });

    it('uses legacy extraction if PromptParser returns legacy format', () => {
      global.PromptParser = { parsePrompt: () => ({ format: 'legacy' }) };
      const prompt = '## BOUNDARIES\nBnd\n## PROCESS\nPrc';
      expect(compiler.extractAgentContent(prompt)).toEqual({ boundaries: 'Bnd', process: 'Prc' });
      global.PromptParser = PromptParser; // restore
    });

    it('uses XML extraction if PromptParser returns xml format', () => {
      global.PromptParser = { parsePrompt: () => ({
        format: 'xml',
        sections: [
          { tag: 'task', content: 'XML Boundary' },
          { tag: 'step', id: '1', name: 'Init', content: 'Do something' }
        ]
      })};

      expect(compiler.extractAgentContent('<prompt></prompt>')).toEqual({
        boundaries: 'XML Boundary',
        process: 'Step 1: Init\nDo something'
      });
      global.PromptParser = PromptParser; // restore
    });

    it('handles XML format without explicitly defined task boundaries', () => {
      global.PromptParser = { parsePrompt: () => ({
        format: 'xml',
        sections: [
          { tag: 'step', content: 'Do something' }
        ]
      })};

      expect(compiler.extractAgentContent('<prompt></prompt>')).toEqual({
        boundaries: 'No explicit boundaries found in XML.',
        process: 'Step ?: Action\nDo something'
      });
      global.PromptParser = PromptParser; // restore
    });

    it('handles XML format without step sections', () => {
      global.PromptParser = { parsePrompt: () => ({
        format: 'xml',
        sections: [
          { tag: 'task', content: 'Task' }
        ]
      })};

      expect(compiler.extractAgentContent('<prompt></prompt>')).toEqual({
        boundaries: 'Task',
        process: 'No explicit steps found in XML.'
      });
      global.PromptParser = PromptParser; // restore
    });
  });

  describe('stitch', () => {
    beforeEach(() => {
      global.PromptParser = undefined; // Force legacy for consistent testing
    });

    afterEach(() => {
      global.PromptParser = PromptParser;
    });

    it('enforces DAG ordering by swapping if idx2 < idx1', () => {
      const agent1 = mockBaseAgents.find(a => a.name === 'Helix'); // index 3
      const agent2 = mockBaseAgents.find(a => a.name === 'Janitor'); // index 0

      const stitched = compiler.stitch(agent1, agent2);
      // Janitor should be phase 1, Helix should be phase 2
      expect(stitched).toContain('Phase 1: The Janitor Phase');
      expect(stitched).toContain('Phase 2: The Helix Phase');
    });

    it('keeps ordering if idx1 < idx2', () => {
      const agent1 = mockBaseAgents.find(a => a.name === 'Janitor'); // index 0
      const agent2 = mockBaseAgents.find(a => a.name === 'Helix'); // index 3

      const stitched = compiler.stitch(agent1, agent2);
      expect(stitched).toContain('Phase 1: The Janitor Phase');
      expect(stitched).toContain('Phase 2: The Helix Phase');
    });

    it('keeps ordering if agents are unknown (not in pipeline)', () => {
      const agent1 = mockBaseAgents.find(a => a.name === 'Unknown');
      const agent2 = mockBaseAgents.find(a => a.name === 'Architect');

      const stitched = compiler.stitch(agent1, agent2);
      expect(stitched).toContain('Phase 1: The Unknown Phase');
      expect(stitched).toContain('Phase 2: The Architect Phase');
    });

    it('uses overrideName for PR Title if provided', () => {
      const agent1 = mockBaseAgents.find(a => a.name === 'Janitor');
      const agent2 = mockBaseAgents.find(a => a.name === 'Helix');
      const stitched = compiler.stitch(agent1, agent2, 'Custom Title Override');
      expect(stitched).toContain('"pr_title":"Custom Title Override"');
    });
  });

  describe('fuse', () => {
    it('returns error if agent1 or agent2 is missing', () => {
      expect(compiler.fuse(null, {})).toEqual({ name: 'Error', prompt: 'Invalid agents selected.' });
      expect(compiler.fuse({}, undefined)).toEqual({ name: 'Error', prompt: 'Invalid agents selected.' });
    });

    it('handles agents without names gracefully', () => {
      const fused = compiler.fuse({}, {});
      expect(fused.name).toBe('undefinedundefined undefined-undefined Fusion');
    });

    it('returns a custom agent if it matches sorted keys and has a custom prompt', () => {
      const fused = compiler.fuse(
        { name: ' Janitor', emoji: '🧹' },
        { name: 'Helix ', emoji: '🧬' }
      );
      expect(fused.name).toBe('Clean Code');
      expect(fused.isCustom).toBe(true);
      expect(fused.prompt).toBe('Custom Prompt Here');
    });

    it('returns a custom agent with fallback description', () => {
      const c = new FusionCompiler(mockBaseAgents, {
         'Architect,Helix': { name: 'The Void', prompt: null, description: 'Fallback desc' }
      });
      const fused = c.fuse(
        { name: 'Architect', emoji: '📐' },
        { name: 'Helix', emoji: '🧬' }
      );
      expect(fused.name).toBe('The Void');
      expect(fused.isCustom).toBe(true);
      expect(fused.short_description).toBe('Fallback desc');
    });

    it('stitches the void dynamic prompt if custom prompt is null', () => {
      const fused = compiler.fuse(
        { name: 'Helix', emoji: '🧬', prompt: '' },
        { name: 'Architect', emoji: '📐', prompt: '' }
      );
      expect(fused.name).toBe('The Void');
      expect(fused.isCustom).toBe(true);
      expect(fused.prompt).toContain('The Void'); // The PR title from stitch overrideName
    });

    it('dynamically stitches normal pairs', () => {
      const fused = compiler.fuse(
        { name: 'Architect', emoji: '📐', prompt: '' },
        { name: 'Janitor', emoji: '🧹', prompt: '' }
      );
      expect(fused.name).toBe('📐🧹 Architect-Janitor Fusion');
      expect(fused.isCustom).toBe(false);
      expect(fused.short_description).toContain('combining the strengths');
      expect(fused.prompt).toContain('You are a dynamic Fusion Agent');
    });
  });

  describe('Environment Initialization', () => {
    it('should successfully export the module when required', () => {
         jest.isolateModules(() => {
             const { FusionCompiler: fc } = require('./index');
             expect(typeof fc).toBe('function');
         });
    });
  });
});
