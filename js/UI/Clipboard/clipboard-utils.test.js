/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

const ClipboardUtils = require('./clipboard-utils');
const TelemetryUtils = require('../../Utils/telemetry-utils');

describe('ClipboardUtils', () => {
    describe('copyText', () => {
        beforeEach(() => {
            // Reset navigator clipboard mock
            Object.assign(navigator, {
                clipboard: {
                    writeText: jest.fn().mockResolvedValue()
                }
            });

            document.execCommand = jest.fn().mockReturnValue(true);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should use modern Clipboard API if available', async () => {
            const result = await ClipboardUtils.copyText('test');
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
            expect(result).toBe(true);
        });

        it('should fallback to execCommand if Clipboard API fails', async () => {
            navigator.clipboard.writeText.mockRejectedValue(new Error('Failed'));

            jest.spyOn(TelemetryUtils, 'dispatchEvent').mockImplementation(() => {});

            const result = await ClipboardUtils.copyText('test');

            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_API_FAILED', expect.any(Error));
            expect(result).toBe(true);
        });

        it('should fallback to execCommand if Clipboard API is entirely unavailable', async () => {
             // Wipe out navigator.clipboard
             Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

             const result = await ClipboardUtils.copyText('test');

             expect(document.execCommand).toHaveBeenCalledWith('copy');
             expect(result).toBe(true);
        });

        it('should return false if both methods fail', async () => {
             navigator.clipboard.writeText.mockRejectedValue(new Error('Failed'));
             document.execCommand.mockImplementation(() => {
                 throw new Error('Exec failed');
             });

             jest.spyOn(TelemetryUtils, 'dispatchEvent').mockImplementation(() => {});

             const result = await ClipboardUtils.copyText('test');
             expect(TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('CLIPBOARD_FALLBACK_FAILED', expect.any(Error));
             expect(result).toBe(false);
        });
    });

    describe('animateButtonSuccess', () => {
        let btn;
        let span;
        let primaryIcon;
        let checkIcon;

        beforeEach(() => {
            jest.useFakeTimers();

            btn = document.createElement('button');
            span = document.createElement('span');
            span.innerText = 'Original Text';

            primaryIcon = document.createElement('svg');
            checkIcon = document.createElement('svg');
            checkIcon.classList.add('check-icon');

            btn.appendChild(primaryIcon);
            btn.appendChild(checkIcon);
            btn.appendChild(span);
        });

        afterEach(() => {
             jest.clearAllTimers();
             jest.useRealTimers();
        });

        it('should handle missing button gracefully', () => {
             expect(() => ClipboardUtils.animateButtonSuccess(null, 'Success')).not.toThrow();
        });

        it('should handle missing span gracefully', () => {
             const emptyBtn = document.createElement('button');
             expect(() => ClipboardUtils.animateButtonSuccess(emptyBtn, 'Success')).not.toThrow();
        });

        it('should animate successfully and restore state after duration', () => {
             ClipboardUtils.animateButtonSuccess(btn, 'Copied!', 1000);

             // Immediate changes
             expect(btn.classList.contains('success-state')).toBe(true);
             expect(span.innerText).toBe('Copied!');
             expect(primaryIcon.style.display).toBe('none');
             expect(checkIcon.style.display).toBe('block');
             expect(checkIcon.classList.contains('animate')).toBe(true);

             // Advance time
             jest.advanceTimersByTime(1000);

             // Restored state
             expect(btn.classList.contains('success-state')).toBe(false);
             expect(span.innerText).toBe('Original Text');
             expect(primaryIcon.style.display).toBe('block');
             expect(checkIcon.style.display).toBe('none');
             expect(checkIcon.classList.contains('animate')).toBe(false);
        });

        it('should handle buttons with no icons gracefully', () => {
             // Rebuild button cleanly
             btn = document.createElement('button');
             span = document.createElement('span');
             span.innerText = 'Text Only';
             btn.appendChild(span);

             ClipboardUtils.animateButtonSuccess(btn, 'Success', 1000);
             expect(btn.classList.contains('success-state')).toBe(true);
             expect(btn.querySelector('span').innerText).toBe('Success');

             jest.advanceTimersByTime(1000);
             expect(btn.querySelector('span').innerText).toBe('Text Only');
        });
    });
});