const { TOAST_TYPES, BUTTON_STATES, HTTP_STATUS } = require('./ui.js');

describe('UI Constants', () => {
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
