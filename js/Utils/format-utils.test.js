global.PromptParser = require('./prompt-parser.js');
const FormatUtils = require('./format-utils');

describe('FormatUtils', () => {
  describe('Constants', () => {
    it('should return the correct MASTER_ROSTER_HEADER', () => {
      expect(FormatUtils.MASTER_ROSTER_HEADER).toBe(
        'JULES MASTER AGENT ROSTER\n\n--------------------------------------------------------------------------------\n\n',
      );
    });

    it('should return the correct CUSTOM_ROSTER_HEADER', () => {
      expect(FormatUtils.CUSTOM_ROSTER_HEADER).toBe(
        'JULES CUSTOM AGENT ROSTER (FUSIONS)\n\n--------------------------------------------------------------------------------\n\n',
      );
    });
  });

  describe('formatAgentPrompts', () => {
    it('should return empty string for non-arrays', () => {
      expect(FormatUtils.formatAgentPrompts(null)).toBe('');
      expect(FormatUtils.formatAgentPrompts(undefined)).toBe('');
      expect(FormatUtils.formatAgentPrompts('string')).toBe('');
      expect(FormatUtils.formatAgentPrompts({})).toBe('');
      expect(FormatUtils.formatAgentPrompts(123)).toBe('');
    });

    it('should format an array of agents correctly', () => {
      const agents = [{ prompt: 'Agent 1 prompt' }, { prompt: 'Agent 2 prompt' }];
      const expected =
        'Agent 1 prompt\n\n--------------------------------------------------------------------------------\n\nAgent 2 prompt\n\n--------------------------------------------------------------------------------';
      expect(FormatUtils.formatAgentPrompts(agents)).toBe(expected);
    });

    it('should return empty string for empty array', () => {
      expect(FormatUtils.formatAgentPrompts([])).toBe('');
    });
  });

  describe('escapeHTML', () => {
    it('should escape &, <, >, ", \' characters', () => {
      const input = '& < > " \'';
      const expected = '&amp; &lt; &gt; &quot; &#039;';
      expect(FormatUtils.escapeHTML(input)).toBe(expected);
    });

    it('should return empty string for falsy inputs like null and undefined', () => {
      expect(FormatUtils.escapeHTML(null)).toBe('');
      expect(FormatUtils.escapeHTML(undefined)).toBe('');
      expect(FormatUtils.escapeHTML('')).toBe('');
    });

    it('should treat 0 and false as empty strings since the code explicitly checks !str', () => {
      expect(FormatUtils.escapeHTML(0)).toBe('');
      expect(FormatUtils.escapeHTML(false)).toBe('');
      expect(FormatUtils.escapeHTML({})).toBe('[object Object]');
    });
  });

  describe('escapeRegex', () => {
    it('should escape regex control characters', () => {
      const input = '.*+?^${}()|[]\\';
      const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
      expect(FormatUtils.escapeRegex(input)).toBe(expected);
    });

    it('should return empty string for falsy inputs like null and undefined', () => {
      expect(FormatUtils.escapeRegex(null)).toBe('');
      expect(FormatUtils.escapeRegex(undefined)).toBe('');
      expect(FormatUtils.escapeRegex('')).toBe('');
    });

    it('should handle non-strings gracefully', () => {
      expect(FormatUtils.escapeRegex(123)).toBe('');
      expect(FormatUtils.escapeRegex({})).toBe('');
    });
  });

  describe('extractIcon and extractDisplayName', () => {
    describe('extractIcon', () => {
      it('should return fallback if agent is null', () => {
        expect(FormatUtils.extractIcon(null)).toBe('🤖');
        expect(FormatUtils.extractIcon(null, '❓')).toBe('❓');
      });

      it('should return agent emoji if it exists', () => {
        const agent = { emoji: '🔥' };
        expect(FormatUtils.extractIcon(agent)).toBe('🔥');
      });

      it('should return fallback if name is empty', () => {
        expect(FormatUtils.extractIcon({})).toBe('🤖');
      });
    });

    describe('extractDisplayName', () => {
      it('should return Unknown Protocol if agent or name is falsy', () => {
        expect(FormatUtils.extractDisplayName(null)).toBe('Unknown Protocol');
        expect(FormatUtils.extractDisplayName({})).toBe('Unknown Protocol');
        expect(FormatUtils.extractDisplayName({ name: '' })).toBe('Unknown Protocol');
      });

      it('should return trimmed name', () => {
        const agent = { name: '  Normal Agent  ' };
        expect(FormatUtils.extractDisplayName(agent)).toBe('Normal Agent');
      });
    });

    describe('extractRepoPath', () => {
      it('should return an empty string if sourceName is falsy', () => {
        expect(FormatUtils.extractRepoPath(null)).toBe('');
        expect(FormatUtils.extractRepoPath(undefined)).toBe('');
        expect(FormatUtils.extractRepoPath('')).toBe('');
      });

      it('should strip sources/github/ from standard sourceName inputs', () => {
        expect(FormatUtils.extractRepoPath('sources/github/owner/repo')).toBe('owner/repo');
        expect(FormatUtils.extractRepoPath('sources/github/jules-platform')).toBe('jules-platform');
      });

      it('should return the original string if sources/github/ is not present', () => {
        expect(FormatUtils.extractRepoPath('owner/repo')).toBe('owner/repo');
        expect(FormatUtils.extractRepoPath('other/source/repo')).toBe('other/source/repo');
      });
    });
  });
});

describe('environment exports', () => {
  it('exports gracefully across different environment module definitions', () => {
    const fs = require('fs');
    const code = fs.readFileSync('js/Utils/format-utils.js', 'utf8');

    // Assert exports assign successfully in Node-like environment
    let isExported = false;
    let moduleMock = {
      get exports() {
        return {};
      },
      set exports(val) {
        isExported = true;
      },
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
});
