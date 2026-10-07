/**
 * @jest-environment jsdom
 */

const TerminalEvents = require('./TerminalEvents');

describe('TerminalEvents Missing Error Handling', () => {
    let appMock;
    let eventListeners;
    let originalTu;

    beforeEach(() => {
        jest.clearAllMocks();
        eventListeners = {};
        originalTu = global.TelemetryUtils;

        appMock = {
            elements: {
                julesRepoPicker: {
                    addEventListener: jest.fn((event, cb) => {
                        eventListeners[event] = cb;
                    })
                }
            },
            julesTerminal: {
                loadActiveSessionsForRepo: jest.fn(),
                loadPullRequestsForRepo: jest.fn()
            },
            renderAgents: jest.fn(),
            _cardHtmlCache: { clear: jest.fn() },
            _domNodeCache: { clear: jest.fn() }
        };
    });

    afterEach(() => {
        global.TelemetryUtils = originalTu;
    });

    // 🕵️ The Interrogation: Assert failure on nested telemetry throw, proving the alibi breaks.
    it('should throw an unhandled rejection when TelemetryUtils.dispatchEvent fails inside loadActiveSessionsForRepo catch block', async () => {
        TerminalEvents.bind(appMock);
        const changeHandler = eventListeners['change'];

        global.TelemetryUtils = {
            dispatchEvent: jest.fn(() => {
                throw new Error('Telemetry Error');
            })
        };

        const sessionError = new Error('Session Load Error');
        let catchPromise;
        const rejectPromise = Promise.reject(sessionError);

        appMock.julesTerminal.loadActiveSessionsForRepo.mockReturnValue({
            catch: (cb) => {
                catchPromise = rejectPromise.catch(cb);
                return catchPromise;
            }
        });

        appMock.julesTerminal.loadPullRequestsForRepo.mockReturnValue({
            catch: jest.fn()
        });

        const event = { target: { value: 'repo1' } };

        changeHandler(event);

        // Mathematically prove that the catch block explicitly fails to catch the nested telemetry error
        await expect(catchPromise).rejects.toThrow('Telemetry Error');
    });

    it('should throw an unhandled rejection when TelemetryUtils.dispatchEvent fails inside loadPullRequestsForRepo catch block', async () => {
        TerminalEvents.bind(appMock);
        const changeHandler = eventListeners['change'];

        global.TelemetryUtils = {
            dispatchEvent: jest.fn(() => {
                throw new Error('Telemetry Error');
            })
        };

        const prError = new Error('PR Load Error');
        let catchPromise;
        const rejectPromise = Promise.reject(prError);

        appMock.julesTerminal.loadActiveSessionsForRepo.mockReturnValue({ catch: jest.fn() });
        appMock.julesTerminal.loadPullRequestsForRepo.mockReturnValue({
            catch: (cb) => {
                catchPromise = rejectPromise.catch(cb);
                return catchPromise;
            }
        });

        const event = { target: { value: 'repo1' } };
        changeHandler(event);

        await expect(catchPromise).rejects.toThrow('Telemetry Error');
    });
});
