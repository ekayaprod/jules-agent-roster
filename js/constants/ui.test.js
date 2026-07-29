const { TOAST_TYPES, BUTTON_STATES, HTTP_STATUS, ANIMATION_DURATIONS } = require('./ui.js');

describe('UI Constants', () => {
  it('should freeze ANIMATION_DURATIONS', () => {
    expect(Object.isFrozen(ANIMATION_DURATIONS)).toBe(true);
    expect(ANIMATION_DURATIONS.FUSION_BURST_MS).toBe(3500);
  });

  it('should freeze TOAST_TYPES', () => {
    expect(Object.isFrozen(TOAST_TYPES)).toBe(true);
    expect(TOAST_TYPES.SUCCESS).toBe('success');
    expect(TOAST_TYPES.ERROR).toBe('error');
    expect(TOAST_TYPES.INFO).toBe('info');
  });

  it('should freeze BUTTON_STATES', () => {
    expect(Object.isFrozen(BUTTON_STATES)).toBe(true);
    expect(BUTTON_STATES.READY).toBe('ready');
    expect(BUTTON_STATES.LOADING).toBe('loading');
    expect(BUTTON_STATES.ERROR).toBe('error');
    expect(BUTTON_STATES.DISABLED).toBe('disabled');
  });

  it('should freeze HTTP_STATUS', () => {
    expect(Object.isFrozen(HTTP_STATUS)).toBe(true);
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

  it('exports gracefully across different environment module definitions', () => {
      const fs = require('fs');
      const code = fs.readFileSync('js/constants/ui.js', 'utf8');

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
