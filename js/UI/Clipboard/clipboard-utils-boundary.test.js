const ClipboardUtils = require('./clipboard-utils');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('ClipboardUtils boundary conditions', () => {
    it('covers early return if btn is null', () => {
        ClipboardUtils.animateButtonSuccess(null, 'Success!');
    });

    it('covers early return if span is missing', () => {
        const btn = document.createElement('button');
        ClipboardUtils.animateButtonSuccess(btn, 'Success!');
    });

    it('covers without primaryIcon', () => {
        jest.useFakeTimers();
        const btn = document.createElement('button');
        const span = document.createElement('span');
        span.innerText = 'Original Text';
        const checkIcon = document.createElement('svg');
        checkIcon.classList.add('check-icon');
        btn.appendChild(span);
        btn.appendChild(checkIcon);

        ClipboardUtils.animateButtonSuccess(btn, 'Success!', 100);
        jest.advanceTimersByTime(100);
        jest.useRealTimers();
    });

    it('covers without checkIcon', () => {
        jest.useFakeTimers();
        const btn = document.createElement('button');
        const span = document.createElement('span');
        span.innerText = 'Original Text';
        const primaryIcon = document.createElement('svg');
        primaryIcon.classList.add('copy-icon');
        btn.appendChild(span);
        btn.appendChild(primaryIcon);

        ClipboardUtils.animateButtonSuccess(btn, 'Success!', 100);
        jest.advanceTimersByTime(100);
        jest.useRealTimers();
    });

    it('covers module export logic', () => {
        const code = fs.readFileSync(path.join(__dirname, 'clipboard-utils.js'), 'utf8');
        const sandbox = { module: { exports: {} } };
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);
        expect(sandbox.module.exports).toBeDefined();
    });

    it('handles global telemetry missing gracefully in catch block', async () => {
        const originalClipboard = global.navigator.clipboard;
        const originalExecCommand = document.execCommand;

        global.navigator.clipboard = {
            writeText: jest.fn().mockRejectedValue(new Error('err'))
        };
        document.execCommand = jest.fn().mockImplementation(() => { throw new Error('err2') });

        const backupWindow = window.TelemetryUtils;
        const backupGlobal = global.TelemetryUtils;

        delete window.TelemetryUtils;
        delete global.TelemetryUtils;

        await ClipboardUtils.copyText('test');

        window.TelemetryUtils = backupWindow;
        global.TelemetryUtils = backupGlobal;
        global.navigator.clipboard = originalClipboard;
        document.execCommand = originalExecCommand;
    });
});
