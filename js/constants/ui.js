var TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
});

var BUTTON_STATES = Object.freeze({
  READY: 'ready',
  LOADING: 'loading',
  ERROR: 'error',
  DISABLED: 'disabled'
});

var HTTP_STATUS = Object.freeze({
  OK: 200,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500
});

var UI_TIMINGS = Object.freeze({
  MODAL_FOCUS_DELAY_MS: 50
});

var ANIMATION_DURATIONS = Object.freeze({
  FUSION_BURST_MS: 3500
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOAST_TYPES, BUTTON_STATES, HTTP_STATUS, UI_TIMINGS, ANIMATION_DURATIONS };
}
