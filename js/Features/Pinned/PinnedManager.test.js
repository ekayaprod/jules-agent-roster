const PinnedManager = require('./PinnedManager');

// Mock StorageUtils to prevent actual localStorage interactions and test boundaries
global.StorageUtils = {
  getJsonArrayItem: jest.fn(),
  setJsonItem: jest.fn(),
};

describe('PinnedManager', () => {
  let manager;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with an empty set if localStorage returns null', () => {
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce(null);
      manager = new PinnedManager();
      expect(manager.getPinned()).toEqual([]);
      expect(global.StorageUtils.getJsonArrayItem).toHaveBeenCalledWith(
        'jules_pinned_agents',
        'PINNED_LOAD_FAILED',
      );
    });

    it('should initialize with stored keys if localStorage returns valid array', () => {
      const storedKeys = ['agent_1', 'agent_2'];
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce(storedKeys);
      manager = new PinnedManager();
      expect(manager.getPinned()).toEqual(storedKeys);
    });

    // THE BOUNDARY INTERROGATION: Explicitly asserts graceful type coercion when localStorage returns numerical arrays.
    it('should strictly coerce numerical array values from localStorage into strings to prevent toggle mismatch', () => {
      const storedKeys = [0, 1];
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce(storedKeys);
      manager = new PinnedManager();

      // Should cast to string internally during init, so it matches the togglePin string boundary
      expect(manager.isPinned(0)).toBe(true);
      expect(manager.getPinned()).toEqual(['0', '1']);
    });

    it('should gracefully handle malformed JSON parses by returning an empty array if StorageUtils returns null during exception', () => {
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce(null); // StorageUtils handles the try/catch and returns null
      manager = new PinnedManager();
      expect(manager.getPinned()).toEqual([]);
    });
  });

  describe('State Mutations (togglePin)', () => {
    beforeEach(() => {
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce([]);
      manager = new PinnedManager();
    });

    it('should add a key if it does not exist and call save()', () => {
      const result = manager.togglePin('agent_1');
      expect(result).toBe(true);
      expect(manager.getPinned()).toEqual(['agent_1']);
      expect(global.StorageUtils.setJsonItem).toHaveBeenCalledWith(
        'jules_pinned_agents',
        ['agent_1'],
        'PinnedManager',
      );
    });

    it('should remove a key if it already exists and call save()', () => {
      manager.togglePin('agent_1'); // Add
      jest.clearAllMocks();

      const result = manager.togglePin('agent_1'); // Remove
      expect(result).toBe(false);
      expect(manager.getPinned()).toEqual([]);
      expect(global.StorageUtils.setJsonItem).toHaveBeenCalledWith(
        'jules_pinned_agents',
        [],
        'PinnedManager',
      );
    });

    it('should cast numeric zero properly instead of resolving to falsy boundary', () => {
      const result = manager.togglePin(0);
      expect(result).toBe(true);
      expect(manager.getPinned()).toEqual(['0']);
    });

    it('should handle undefined and null boundaries gracefully without throwing', () => {
      expect(manager.togglePin(null)).toBe(false);
      expect(manager.togglePin(undefined)).toBe(false);
      expect(manager.togglePin('')).toBe(false); // Falsy check logic: !key returns true if empty string
      expect(manager.getPinned()).toEqual([]);
      expect(global.StorageUtils.setJsonItem).not.toHaveBeenCalled();
    });

    it('should survive heavy concurrency stress mutations without race condition drops', async () => {
      // Concurrent additions
      const additions = ['a1', 'a2', 'a3', 'a4', 'a5'].map(
        (key) => async () => manager.togglePin(key),
      );
      await Promise.all(additions.map((fn) => fn()));

      expect(manager.getPinned().length).toBe(5);
      expect(manager.getPinned()).toEqual(expect.arrayContaining(['a1', 'a2', 'a3', 'a4', 'a5']));

      // Concurrent removals and additions overlapping
      const mutations = [
        async () => manager.togglePin('a1'), // Remove
        async () => manager.togglePin('a6'), // Add
        async () => manager.togglePin('a2'), // Remove
        async () => manager.togglePin('a7'), // Add
      ];

      await Promise.all(mutations.map((fn) => fn()));

      expect(manager.getPinned().length).toBe(5);
      expect(manager.getPinned()).toEqual(expect.arrayContaining(['a3', 'a4', 'a5', 'a6', 'a7']));
      expect(manager.getPinned()).not.toContain('a1');
      expect(manager.getPinned()).not.toContain('a2');
    });
  });

  describe('State Queries (isPinned & getPinned)', () => {
    beforeEach(() => {
      global.StorageUtils.getJsonArrayItem.mockReturnValueOnce(['agent_x', 'agent_y']);
      manager = new PinnedManager();
    });

    it('should return true for existing keys', () => {
      expect(manager.isPinned('agent_x')).toBe(true);
    });

    it('should return false for missing keys', () => {
      expect(manager.isPinned('agent_z')).toBe(false);
    });

    it('should handle null/undefined queries gracefully', () => {
      expect(manager.isPinned(null)).toBe(false);
      expect(manager.isPinned(undefined)).toBe(false);
      expect(manager.isPinned('')).toBe(false);
    });

    it('should return the current array representing the set accurately', () => {
      expect(manager.getPinned()).toEqual(['agent_x', 'agent_y']);
    });
  });
});
