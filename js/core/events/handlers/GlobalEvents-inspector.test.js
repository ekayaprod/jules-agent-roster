/**
 * @jest-environment jsdom
 */

const GlobalEvents = require('./GlobalEvents');

describe('GlobalEvents Inspector Tests', () => {
    let appMock;

    beforeEach(() => {
        appMock = {
            elements: {},
            activeDropdowns: new Set(),
            exportController: {
                downloadCustomAgentsByParent: jest.fn()
            }
        };
    });

    // 🕵️ VULNERABILITY INTERROGATION: Asserting the alibi breaks when downloadCustomAgentsByParent throws
    it('should throw an unhandled error when app.exportController.downloadCustomAgentsByParent fails', () => {
        const btn = document.createElement('button');
        btn.id = 'downloadParentFusionsBtn';
        btn.dataset.parentName = 'TestParent';
        btn.dataset.action = 'download-parent-fusions'; // Provide the target attribute required for propagation
        document.body.appendChild(btn);

        appMock.exportController.downloadCustomAgentsByParent.mockImplementation(() => {
            throw new Error('downloadCustomAgentsByParent catastrophic failure');
        });

        GlobalEvents.bind(appMock);

        // Mathematically prove that the click handler explicitly fails to catch the error

        const errorEvent = jest.fn((e) => e.preventDefault());
        window.addEventListener('error', errorEvent);

        btn.click();

        expect(errorEvent).toHaveBeenCalled();
        expect(errorEvent.mock.calls[0][0].error.message).toBe('downloadCustomAgentsByParent catastrophic failure');

        window.removeEventListener('error', errorEvent);

        document.body.innerHTML = '';

        // Wipe the prints explicitly just in case, though Jest clears mock state in between test runs.
        jest.restoreAllMocks();
    });
});
