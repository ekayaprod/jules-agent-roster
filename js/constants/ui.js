const TOAST_TYPES = Object.freeze({
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success'
});

const BUTTON_STATES = Object.freeze({
  DISABLED: 'disabled',
  ERROR: 'error',
  LOADING: 'loading',
  READY: 'ready'
});

const HTTP_STATUS = Object.freeze({
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
  UNAUTHORIZED: 401
});

/**
 * Extracted in v0.9.0 to eliminate magic number UI timing entropy.
 */
const UI_TIMINGS = Object.freeze({
  MODAL_FOCUS_DELAY_MS: 50
});

const ANIMATION_DURATIONS = Object.freeze({
  FUSION_BURST_MS: 3500
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOAST_TYPES, BUTTON_STATES, HTTP_STATUS, UI_TIMINGS, ANIMATION_DURATIONS };
}
