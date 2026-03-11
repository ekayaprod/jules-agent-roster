# Toast Notification System

## Overview

The `ToastNotification` system provides an accessible, non-blocking visual feedback mechanism for users. It is designed to handle queuing and display logic while heavily prioritizing semantic DOM roles and attributes to fully support screen readers.

## Architecture

The core of the system resides in `ToastNotification.js`, a vanilla JavaScript class that binds to a specific DOM element upon initialization. It acts as a single-instance controller, managing the active toast's lifecycle, layout, and accessibility state.

### Accessibility Patterns

The system dynamically swaps `role` and `aria-live` attributes based on the severity of the notification payload.

- **Errors (`type: 'error'`):** Configured with `role="alert"` and `aria-live="assertive"` to immediately interrupt screen readers, ensuring critical failures are communicated without delay.
- **Success/Info (`type: 'success'` | `'info'`):** Configured with `role="status"` and `aria-live="polite"` to append to the screen reader's queue without interrupting the current focus flow.

### Lifecycle & Dismissal Flow

To prevent users from missing critical feedback, the auto-dismiss timer is dynamically managed based on user interaction:

1. **Initialization:** When `show()` is invoked, a timeout is started based on the provided `duration` (defaulting to 3000ms).
2. **Hover Pause:** If the user hovers (`pointerenter`) over the active toast, the internal timer is completely cleared, holding the toast on screen indefinitely.
3. **Graceful Resume:** When the user's cursor leaves the toast (`pointerleave`), the timer is not reset to the original full duration. Instead, it resumes with a shortened grace period (`RESUME_DELAY` of 2000ms), giving the user enough time to finish reading before the element visually dismisses.
4. **Immediate Dismissal:** Users can manually force immediate dismissal by clicking the integrated close button (`.toast-close-btn`).
