const StorageUtils = require('./storage-utils');

describe('StorageUtils', () => {
  let mockLocalStorage;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    // Temporarily replace global.localStorage
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true,
    });

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getJsonArrayItem', () => {
    it('returns parsed array when localStorage has valid JSON array', () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
      expect(result).toEqual(mockData);
    });

    it('returns null when localStorage has valid JSON but not an array', () => {
      const mockData = { id: 1 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(result).toBeNull();
    });

    it('returns null when localStorage item does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(result).toBeNull();
    });

    it('returns null and logs error when parsing fails', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('test_event');
      expect(logCall).toContain('invalid-json');
    });

    it('returns null when localStorage is undefined', () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(result).toBeNull();
    });

    it('handles exceptions when localStorage.getItem throws', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('getItem failed');
      });

      const result = StorageUtils.getJsonArrayItem('test_key', 'test_event');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('setJsonItem', () => {
    it('stringifies data and saves to localStorage', () => {
      const mockData = { id: 1, name: 'Test' };

      StorageUtils.setJsonItem('test_key', mockData, 'TestComponent');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(mockData));
    });

    it('does nothing when localStorage is undefined', () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      StorageUtils.setJsonItem('test_key', {}, 'TestComponent');
    });

    it('logs a warning when localStorage.setItem throws an error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota Exceeded');
      });

      StorageUtils.setJsonItem('test_key', {}, 'TestComponent');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'TestComponent: Failed to save to localStorage',
        expect.any(Error),
      );
    });
  });

  describe('getItem', () => {
    it('returns string value when it exists in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('stored_value');

      const result = StorageUtils.getItem('test_key', 'default_value');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_key');
      expect(result).toBe('stored_value');
    });

    it('returns defaultValue when item does not exist in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageUtils.getItem('test_key', 'default_value');

      expect(result).toBe('default_value');
    });

    it('returns defaultValue when localStorage is undefined', () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = StorageUtils.getItem('test_key', 'default_value');

      expect(result).toBe('default_value');
    });

    it('returns defaultValue when localStorage.getItem throws an error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('getItem failed');
      });

      const result = StorageUtils.getItem('test_key', 'default_value');

      expect(result).toBe('default_value');
    });

    it('returns defaultValue when accessing global.localStorage throws a SecurityError', () => {
      const originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');

      try {
        Object.defineProperty(global, 'localStorage', {
          get: () => {
            throw new Error('SecurityError: Access to this API has been disallowed');
          },
          configurable: true,
        });

        const result = StorageUtils.getItem('test_key', 'default_value');

        expect(result).toBe('default_value');
      } finally {
        Object.defineProperty(global, 'localStorage', originalLocalStorage);
      }
    });

    it('returns empty string when no defaultValue is provided and item is missing', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = StorageUtils.getItem('test_key');

      expect(result).toBe('');
    });
  });

  describe('setItem', () => {
    it('saves string value to localStorage', () => {
      StorageUtils.setItem('test_key', 'test_value');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
    });

    it('does nothing when localStorage is undefined', () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      StorageUtils.setItem('test_key', 'test_value');
    });

    it('logs a warning when localStorage.setItem throws an error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota Exceeded');
      });

      StorageUtils.setItem('test_key', 'test_value');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to save string to localStorage',
        expect.any(Error),
      );
    });
  });
});
