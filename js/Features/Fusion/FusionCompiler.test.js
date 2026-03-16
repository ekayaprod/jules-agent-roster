const PromptParser = require('../../Utils/prompt-parser');
global.PromptParser = PromptParser;
const FusionCompiler = require('./FusionCompiler');

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
      expect(compiler.customAgentsMap['Architect,Helix'].name).toBe('The Void');
      expect(compiler.customAgentsMap['Helix,Janitor'].name).toBe('Clean Code');
    });

    it('handles null/undefined customAgents gracefully', () => {
      const c = new FusionCompiler([], null);
      expect(c.customAgentsMap).toEqual({});
    });
  });




  describe('fuse', () => {
    it('returns error if agent1 or agent2 is missing', () => {
      expect(compiler.fuse(null, {})).toEqual({ name: 'Error', prompt: 'Invalid agents selected.' });
      expect(compiler.fuse({}, undefined)).toEqual({ name: 'Error', prompt: 'Invalid agents selected.' });
    });

    it('handles agents without names gracefully', () => {
      const fused = compiler.fuse({}, {});
      expect(fused.name).toBe('Error');
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
        { name: 'Architect', emoji: '📐', prompt: '' },
        { name: 'Helix', emoji: '🧬', prompt: '' }
      );
      expect(fused.name).toBe('The Void');
      expect(fused.isCustom).toBe(true);
      expect(fused.prompt).toBeNull();
    });

    it('returns an error if combination is unknown', () => {
      const fused = compiler.fuse(
        { name: 'Architect', emoji: '📐', prompt: '' },
        { name: 'Janitor', emoji: '🧹', prompt: '' }
      );
      expect(fused.name).toBe('Error');
      expect(fused.prompt).toBe('Invalid agents selected.');
    });
  });

  describe('Environment Initialization', () => {
    it('should successfully export the module when required', () => {
         jest.isolateModules(() => {
             const FusionCompilerClass = require('./FusionCompiler');
             expect(typeof FusionCompilerClass).toBe('function');
         });
    });
  });
});
