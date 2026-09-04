const ClipboardUtils = require('./clipboard-utils');

describe('ClipboardUtils', () => {
    let originalClipboard;
    let originalExecCommand;
    let originalWindowTelemetryUtils;
    let originalGlobalTelemetryUtils;

    beforeEach(() => {
        originalClipboard = global.navigator.clipboard;
        originalExecCommand = document.execCommand;
        originalWindowTelemetryUtils = window.TelemetryUtils;
        originalGlobalTelemetryUtils = global.TelemetryUtils;

        window.TelemetryUtils = { dispatchEvent: jest.fn() };
        global.TelemetryUtils = window.TelemetryUtils;

        global.navigator = global.navigator || {};
        global.navigator.clipboard = {
            writeText: jest.fn()
        };
        document.execCommand = jest.fn();
    });

    afterEach(() => {
        global.navigator.clipboard = originalClipboard;
        document.execCommand = originalExecCommand;
        window.TelemetryUtils = originalWindowTelemetryUtils;
        global.TelemetryUtils = originalGlobalTelemetryUtils;
        jest.clearAllMocks();
    });

    describe('copyText', () => {
        it('should use modern Clipboard API if available', async () => {
            global.navigator.clipboard.writeText.mockResolvedValue(undefined);
            const result = await ClipboardUtils.copyText('test text');
            expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
            expect(result).toBe(true);
            expect(document.execCommand).not.toHaveBeenCalled();
        });

        it('should fallback to execCommand if Clipboard API fails and dispatch telemetry', async () => {
            const mockError = new Error('Clipboard denied');
            global.navigator.clipboard.writeText.mockRejectedValue(mockError);
            document.execCommand.mockReturnValue(true);

            const result = await ClipboardUtils.copyText('test text');

            expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
            expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_API_FAILED', mockError);
            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(result).toBe(true);
        });

        it('should fallback to execCommand if Clipboard API throws synchronous error and dispatch telemetry', async () => {
            const mockError = new Error('Clipboard synchronous error');
            global.navigator.clipboard.writeText.mockImplementation(() => { throw mockError; });
            document.execCommand.mockReturnValue(true);

            const result = await ClipboardUtils.copyText('test text');

            expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
            expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_API_FAILED', mockError);
            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(result).toBe(true);
        });

        it('should completely fallback if execCommand fails and dispatch telemetry', async () => {
            const mockApiError = new Error('Clipboard denied');
            const mockFallbackError = new Error('execCommand failed');
            global.navigator.clipboard.writeText.mockRejectedValue(mockApiError);
            document.execCommand.mockImplementation(() => { throw mockFallbackError; });

            const result = await ClipboardUtils.copyText('test text');

            expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_API_FAILED', mockApiError);
            expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_FALLBACK_FAILED', mockFallbackError);
            expect(result).toBe(false);
        });

        it('should use fallback if Clipboard API is not available', async () => {
            delete global.navigator.clipboard;
            document.execCommand.mockReturnValue(true);

            const result = await ClipboardUtils.copyText('test text');

            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(result).toBe(true);
        });

        it('should dispatch telemetry if fallback fails when Clipboard API is not available', async () => {
            delete global.navigator.clipboard;
            const mockFallbackError = new Error('execCommand failed');
            document.execCommand.mockImplementation(() => { throw mockFallbackError; });

            const result = await ClipboardUtils.copyText('test text');

            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_FALLBACK_FAILED', mockFallbackError);
            expect(result).toBe(false);
        });

        it('should always clean up the DOM if an error occurs in execCommand and the catch block itself throws', async () => {
            delete global.navigator.clipboard;
            const mockFallbackError = new Error('execCommand failed');
            document.execCommand.mockImplementation(() => { throw mockFallbackError; });
            window.TelemetryUtils.dispatchEvent.mockImplementation(() => { throw new Error('Telemetry failed'); });

            const removeChildSpy = jest.spyOn(document.body, 'removeChild');

            try {
                await ClipboardUtils.copyText('test text');
            } catch (err) {
                expect(err.message).toBe('Telemetry failed');
            }

            expect(removeChildSpy).toHaveBeenCalledTimes(1);
            expect(removeChildSpy).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));

            removeChildSpy.mockRestore();
        });

        it('should clean up the DOM if an error occurs in execCommand', async () => {
            delete global.navigator.clipboard;
            const mockFallbackError = new Error('execCommand failed');
            document.execCommand.mockImplementation(() => { throw mockFallbackError; });

            const removeChildSpy = jest.spyOn(document.body, 'removeChild');

            const result = await ClipboardUtils.copyText('test text');

            expect(result).toBe(false);
            expect(removeChildSpy).toHaveBeenCalledTimes(1);
            expect(removeChildSpy).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));

            removeChildSpy.mockRestore();
        });

        it('should return false if fallback returns false when Clipboard API is not available', async () => {
            delete global.navigator.clipboard;
            document.execCommand.mockReturnValue(false);

            const result = await ClipboardUtils.copyText('test text');

            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(window.TelemetryUtils.dispatchEvent).not.toHaveBeenCalledWith('CLIPBOARD_FALLBACK_FAILED', expect.any(Error));
            expect(result).toBe(false);
        });

        it('should silently catch errors if TelemetryUtils is missing during Clipboard API failure', async () => {
            const mockError = new Error('Clipboard denied');
            global.navigator.clipboard.writeText.mockRejectedValue(mockError);
            document.execCommand.mockReturnValue(true);

            const getTelemetrySpy = jest.spyOn(ClipboardUtils, '_getTelemetryUtils').mockReturnValue(null);

            const result = await ClipboardUtils.copyText('test text');

            expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
            expect(window.TelemetryUtils.dispatchEvent).not.toHaveBeenCalled();
            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(result).toBe(true);

            getTelemetrySpy.mockRestore();
        });

        it('should silently catch errors if TelemetryUtils is missing during fallback execCommand failure', async () => {
            delete global.navigator.clipboard;
            const mockFallbackError = new Error('execCommand failed');
            document.execCommand.mockImplementation(() => { throw mockFallbackError; });

            const getTelemetrySpy = jest.spyOn(ClipboardUtils, '_getTelemetryUtils').mockReturnValue(null);

            const result = await ClipboardUtils.copyText('test text');

            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(window.TelemetryUtils.dispatchEvent).not.toHaveBeenCalled();
            expect(result).toBe(false);

            getTelemetrySpy.mockRestore();
        });
    });

    describe('animateButtonSuccess', () => {
        it('should animate button success state and revert after timeout', () => {
            jest.useFakeTimers();
            const btn = document.createElement('button');
            const span = document.createElement('span');
            span.innerText = 'Original Text';
            const primaryIcon = document.createElement('svg');
            primaryIcon.classList.add('copy-icon');
            const checkIcon = document.createElement('svg');
            checkIcon.classList.add('check-icon');
            checkIcon.classList.add('d-none');

            btn.appendChild(span);
            btn.appendChild(primaryIcon);
            btn.appendChild(checkIcon);

            ClipboardUtils.animateButtonSuccess(btn, 'Success!', 1000);

            expect(btn.classList.contains('success-state')).toBe(true);
            expect(span.innerText).toBe('Success!');
            expect(primaryIcon.classList.contains('d-none')).toBe(true);
            expect(checkIcon.classList.contains('d-none')).toBe(false);
            expect(checkIcon.classList.contains('animate')).toBe(true);

            jest.advanceTimersByTime(1000);

            expect(btn.classList.contains('success-state')).toBe(false);
            expect(span.innerText).toBe('Original Text');
            expect(primaryIcon.classList.contains('d-none')).toBe(false);
            expect(checkIcon.classList.contains('d-none')).toBe(true);
            expect(checkIcon.classList.contains('animate')).toBe(false);

            jest.useRealTimers();
        });

        it('should do nothing if btn is missing', () => {
            expect(() => {
                ClipboardUtils.animateButtonSuccess(null, 'Success!');
            }).not.toThrow();
        });

        it('should do nothing if span is missing', () => {
            const btn = document.createElement('button');
            expect(() => {
                ClipboardUtils.animateButtonSuccess(btn, 'Success!');
            }).not.toThrow();
            expect(btn.classList.contains('success-state')).toBe(false);
        });

        it('should handle missing primary and check icons gracefully', () => {
            jest.useFakeTimers();
            const btn = document.createElement('button');
            const span = document.createElement('span');
            span.innerText = 'Original Text';
            btn.appendChild(span);

            ClipboardUtils.animateButtonSuccess(btn, 'Success!', 1000);

            expect(btn.classList.contains('success-state')).toBe(true);
            expect(span.innerText).toBe('Success!');

            jest.advanceTimersByTime(1000);

            expect(btn.classList.contains('success-state')).toBe(false);
            expect(span.innerText).toBe('Original Text');

            jest.useRealTimers();
        });
    });
});
