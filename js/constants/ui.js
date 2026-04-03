const TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
});

const BUTTON_STATES = Object.freeze({
  READY: 'ready',
  LOADING: 'loading',
  ERROR: 'error',
  DISABLED: 'disabled'
});

const HTTP_STATUS = Object.freeze({
  OK: 200,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOAST_TYPES, BUTTON_STATES, HTTP_STATUS };
}
