global.AgentUtils = require('../Utils/agent-utils.js');
const AgentRepository = require('./AgentRepository');
const NetworkUtils = require('../Utils/network-utils.js');
global.NetworkUtils = NetworkUtils;
const REQUEST_TIMEOUT_MS = AgentRepository.REQUEST_TIMEOUT_MS || 10000;

global.CONFIG = { categories: { architect: 'Architect', developer: 'Developer' } };

describe('AgentRepository', () => {
  let repo;
  let originalFetch;
  let originalConsoleWarn;
  let originalConsoleError;

  beforeEach(() => {
    repo = new AgentRepository();
    originalFetch = global.fetch;
    global.fetch = jest.fn();

    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('handles invalid JSON in localStorage gracefully without throwing', () => {
      const originalLocalStorage = global.localStorage;

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue('invalid json string'),
        },
        writable: true,
      });

      expect(() => {
        new AgentRepository();
      }).not.toThrow();

      if (originalLocalStorage) {
        global.localStorage = originalLocalStorage;
      } else {
        delete global.localStorage;
      }
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid json successfully', async () => {
      const mockResponse = { json: async () => ({ key: 'value' }) };
      const result = await repo.safeJsonParse(mockResponse, 'test.json');
      expect(result).toEqual({ key: 'value' });
    });

    it('catches invalid json and throws formatted error', async () => {
      const mockResponse = {
        json: async () => {
          throw new Error('Unexpected token');
        },
      };

      await expect(repo.safeJsonParse(mockResponse, 'test.json')).rejects.toThrow(
        'Check your configuration file formatting and try again.',
      );
      expect(console.error).toHaveBeenCalledTimes(1);

      const logArgs = JSON.parse(console.error.mock.calls[0][0]);
      expect(logArgs).toEqual({
        event: 'JSON_PARSE_FAILED',
        resource: 'test.json',
        error: 'Unexpected token',
      });
    });
  });

  describe('fetchPrompt', () => {
    it('returns parsed text on success', async () => {
      global.NetworkUtils.fetchWithRetry = jest.fn().mockResolvedValue({
        ok: true,
        text: async () => 'prompt text',
      });

      const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
      expect(res).toBe('prompt text');
    });

    it('returns fallback and warns on non-ok standard prompt', async () => {
      global.NetworkUtils.fetchWithRetry = jest.fn().mockResolvedValue({
        ok: false,
      });

      const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
      expect(res).toBe('fallback');
      expect(console.warn).toHaveBeenCalledWith('Failed to load prompt for AgentName');
    });

    it('returns fallback and avoids warn on non-ok custom prompt', async () => {
      global.NetworkUtils.fetchWithRetry = jest.fn().mockResolvedValue({
        ok: false,
      });

      const res = await repo.fetchPrompt(
        'AgentName',
        'http://example.com/fusions/prompt.md',
        'fallback',
      );
      expect(res).toBe('fallback');
      expect(console.warn).not.toHaveBeenCalledWith('Failed to load prompt for AgentName');
    });

    it('catches throw and returns fallback for standard prompt', async () => {
      const err = new Error('Network');
      global.NetworkUtils.fetchWithRetry = jest.fn().mockRejectedValue(err);

      const res = await repo.fetchPrompt('AgentName', 'http://example.com/prompt.md', 'fallback');
      expect(res).toBe('fallback');
      expect(console.warn).toHaveBeenCalledWith('Error loading prompt for AgentName', err);
    });

    it('catches throw and returns fallback for custom prompt', async () => {
      const err = new Error('Network');
      global.NetworkUtils.fetchWithRetry = jest.fn().mockRejectedValue(err);

      const res = await repo.fetchPrompt(
        'AgentName',
        'http://example.com/fusions/prompt.md',
        'fallback',
      );
      expect(res).toBe('fallback');
      expect(console.warn).toHaveBeenCalledWith('Error loading custom prompt for AgentName', err);
    });
  });

  describe('validateAgentsData', () => {
    it('throws if data is not an array', () => {
      expect(() => repo.validateAgentsData(null)).toThrow(
        'Provide a valid list of agents in the expected format.',
      );
      expect(() => repo.validateAgentsData({})).toThrow(
        'Provide a valid list of agents in the expected format.',
      );
    });

    it('filters invalid agents and warns', () => {
      const invalidAgents = [
        null,
        { name: 123 },
        { name: 'valid', category: 123 },
        { name: 'valid', category: 'unknown_cat' },
      ];

      const res = repo.validateAgentsData(invalidAgents);
      expect(res).toEqual([]);
      expect(console.warn).toHaveBeenCalledTimes(4);
    });

    it('sanitizes valid agents', () => {
      const validAgents = [
        { name: '  Trimmer  ', category: 'architect', scope: 123 },
        { name: 'Fine', category: 'developer' },
      ];

      const res = repo.validateAgentsData(validAgents);

      expect(res).toHaveLength(2);
      expect(res[0].name).toBe('Trimmer');
      expect(res[0].scope).toBe('123'); // Cast to string
      expect(console.warn).toHaveBeenCalledWith(
        'Sanitizing agent Trimmer: scope must be string. Casting.',
      );

      expect(res[1].name).toBe('Fine');
      expect(res[1].scope).toBeUndefined();
    });
  });

  describe('validateCustomAgent', () => {
    it('invalidates non-objects', () => {
      expect(repo.validateCustomAgent('key', null)).toEqual({
        valid: false,
        reason: 'Entry is not an object',
      });
      expect(repo.validateCustomAgent('key', 'string')).toEqual({
        valid: false,
        reason: 'Entry is not an object',
      });
    });

    it('invalidates missing or empty names', () => {
      expect(repo.validateCustomAgent('key', {})).toEqual({
        valid: false,
        reason: "Missing or invalid 'name' field",
      });
      expect(repo.validateCustomAgent('key', { name: '   ' })).toEqual({
        valid: false,
        reason: "Missing or invalid 'name' field",
      });
      expect(repo.validateCustomAgent('key', { name: 123 })).toEqual({
        valid: false,
        reason: "Missing or invalid 'name' field",
      });
    });

    it('sanitizes description fields to strings', () => {
      const mockAgentPayload = {
        name: 'Valid',
        desc: 123,
        description: 456,
        short_description: 789,
      };
      const res = repo.validateCustomAgent('key', mockAgentPayload);

      expect(res.valid).toBe(true);
      expect(res.sanitized.short_description).toBe('789');
    });

    it('normalizes desc to short_description', () => {
      const mockAgentPayload = { name: 'Valid', desc: 'My Desc' };
      const res = repo.validateCustomAgent('key', mockAgentPayload);
      expect(res.valid).toBe(true);
      expect(res.sanitized.short_description).toBe('My Desc');
      expect(res.sanitized.desc).toBeUndefined();
    });

    it('normalizes description to short_description', () => {
      const mockAgentPayload = { name: 'Valid', description: 'My Full Desc' };
      const res = repo.validateCustomAgent('key', mockAgentPayload);
      expect(res.valid).toBe(true);
      expect(res.sanitized.short_description).toBe('My Full Desc');
      expect(res.sanitized.description).toBeUndefined();
    });

    it('rejects malicious patterns (XSS)', () => {
      const maliciousData = [
        { name: '<script>alert(1)</script>' },
        { name: 'Safe', short_description: '<img src=x onerror=alert(1)>' },
        { name: 'Safe', desc: 'javascript:alert(1)' },
        { name: 'Safe', description: 'Click <button>Me</button>' },
        { name: "<iframe src='bad.com'></iframe>" },
      ];

      maliciousData.forEach((mockAgentPayload) => {
        const res = repo.validateCustomAgent('key', mockAgentPayload);
        expect(res.valid).toBe(false);
        expect(res.reason).toBe('Potential malicious content detected');
      });
    });

    it('uses default fallback emoji if no emoji found in JSON payload', () => {
      const res = repo.validateCustomAgent('key', { name: 'Plain Agent' });

      expect(res.valid).toBe(true);
      expect(res.sanitized.emoji).toBe('🤖');
      expect(res.sanitized.name).toBe('Plain Agent');
    });
  });

  describe('fetchAgents and private loaders', () => {
    let originalFetchPrompt;

    beforeEach(() => {
      originalFetchPrompt = repo.fetchPrompt;
      repo.fetchPrompt = jest.fn().mockResolvedValue('Fetched Prompt');

      global.document = {
        getElementById: jest.fn().mockReturnValue({ textContent: '' }),
      };
    });

    afterEach(() => {
      repo.fetchPrompt = originalFetchPrompt;
      delete global.document;
    });

    it('fetchAgents executes and returns combined object', async () => {
      global.NetworkUtils.fetchWithRetry = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { name: 'Standard', category: 'architect', isCustom: false },
            { name: 'Custom1', category: 'developer', isCustom: true },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            'Standard,Agent': 'Custom1',
          }),
        });

      const results = await repo.fetchAgents();

      expect(results.agents).toHaveLength(1);
      expect(results.agents[0].name).toBe('Standard');

      expect(Object.keys(results.customAgents)).toHaveLength(1);
      expect(results.customAgents['Custom1'].name).toBe('Custom1');
      expect(Object.keys(results.fusionMatrix)).toHaveLength(1);

      expect(global.NetworkUtils.fetchWithRetry).toHaveBeenCalledWith('./roster-payload.json', {
        throwOn404: false,
      });
      expect(global.NetworkUtils.fetchWithRetry).toHaveBeenCalledWith('./fusion_matrix.json', {
        throwOn404: false,
      });
    });

    // 🕵️ INTERROGATE: Mocked infrastructure boundaries, concurrency stress, and negative assertions.
    it('fails securely or parses correctly when custom_agents.json lacks domain headers (flat structure)', async () => {
      global.NetworkUtils.fetchWithRetry = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { name: 'Agent1', category: 'architect', isCustom: false },
            { name: 'Fusion1', category: 'developer', isCustom: true },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            'Agent1,Agent2': 'Fusion1',
          }),
        });

      const results = await repo.fetchAgents();
      expect(results.customAgents['Fusion1']).toBeDefined();
      expect(results.customAgents['Fusion1'].name).toBe('Fusion1');
      expect(results.fusionMatrix['Agent1,Agent2']).toBe('Fusion1');
    });

    it('fetchAgents throws on top-level network failure', async () => {
      global.NetworkUtils.fetchWithRetry = jest.fn().mockRejectedValue(new Error('Network Error'));
      await expect(repo.fetchAgents()).rejects.toThrow('Network Error');
    });

    it('filters invalid custom agent gracefully via fetchAgents', async () => {
      global.NetworkUtils.fetchWithRetry = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { name: null, isCustom: true },
            { name: 'Custom 🔥', category: 'developer', isCustom: true },
          ],
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const results = await repo.fetchAgents();
      expect(Object.keys(results.customAgents)).toHaveLength(1);
      expect(results.customAgents['Custom 🔥'].name).toBe('Custom 🔥');
    });

    it('handles safeJsonParse throwing errors gracefully for the roster payload', async () => {
      repo.fetchWithRetry = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Bad json');
        },
      });

      try {
        await repo.fetchAgents();
      } catch (e) {
        // If it resolves, it handles failure gracefully inside fetchAgents
      }
      expect(console.error).toHaveBeenCalled();
    });

    it('logs a critical error when roster-payload.json fails to parse due to malformed JSON', async () => {
      repo.safeJsonParse = jest.fn().mockRejectedValueOnce(new Error('Failed to parse JSON'));

      repo.fetchWithRetry = jest.fn().mockResolvedValue({ ok: true });

      try {
        await repo.fetchAgents();
      } catch (e) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load agent payloads',
        expect.any(Error),
      );
    });

    it('🕵️ INTERROGATE: fails to parse flattened structure without domain categories', async () => {
      global.NetworkUtils.fetchWithRetry = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { name: 'Fusion Agent', short_description: 'A flat agent', isCustom: true },
            { name: 'Another Fusion', short_description: 'Another flat agent', isCustom: true },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            'Agent1,Agent2': 'Fusion Agent',
            'Agent3,Agent4': 'Another Fusion',
          }),
        });

      const results = await repo.fetchAgents();

      expect(results.customAgents['Fusion Agent']).toBeDefined();
      expect(results.customAgents['Fusion Agent'].name).toBe('Fusion Agent');
      expect(results.customAgents['Another Fusion']).toBeDefined();
      expect(results.customAgents['Another Fusion'].name).toBe('Another Fusion');
      expect(results.fusionMatrix['Agent1,Agent2']).toBe('Fusion Agent');
    });

    it('catches missing properties in validateCustomAgent (first responder missing desc logic)', async () => {
      global.NetworkUtils.fetchWithRetry = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ name: 'Agent', isCustom: true }],
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const results = await repo.fetchAgents();
      expect(results.customAgents['Agent'].name).toBe('Agent');
    });
  });
});
