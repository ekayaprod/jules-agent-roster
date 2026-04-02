/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'ExportController.js'), 'utf8');
const ExportController = eval(`
    (function() {
        ${code}
        return ExportController;
    })();
`);

global.ClipboardUtils = {
    copyText: jest.fn(),
    animateButtonSuccess: jest.fn()
};

global.FormatUtils = {
    CUSTOM_ROSTER_HEADER: '# Custom Roster\n',
    MASTER_ROSTER_HEADER: '# Master Roster\n',
    formatAgentPrompts: jest.fn()
};

global.DownloadUtils = {
    downloadTextFile: jest.fn()
};

describe('ExportController', () => {
    let appMock;
    let btnMock;
    let controller;

    beforeEach(() => {
        appMock = {
            agents: [{ prompt: 'core prompt 1' }],
            customAgents: {
                'custom1': { prompt: 'custom prompt 1' },
                'custom2': { prompt: '' }
            },
            fusionLab: {
                compiler: {
                    customAgentsMap: {
                        'fusion1': { prompt: 'fusion prompt 1' }
                    }
                }
            },
            toast: {
                show: jest.fn()
            }
        };
        btnMock = document.createElement('button');
        controller = new ExportController(appMock);

        const { AgentUtils } = require('../../Utils');
global.AgentUtils = AgentUtils;

        jest.clearAllMocks();
    });

    describe('copyAgent', () => {
        it('copies a core agent successfully', async () => {
            global.ClipboardUtils.copyText.mockResolvedValueOnce(true);
            await controller.copyAgent(0, btnMock);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('core prompt 1');
            expect(appMock.toast.show).toHaveBeenCalledWith('Copied to clipboard');
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Copied!');
        });

        it('copies a custom agent successfully', async () => {
            global.ClipboardUtils.copyText.mockResolvedValueOnce(true);
            await controller.copyAgent('custom1', btnMock);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('custom prompt 1');
        });

        it('copies a fusion agent successfully', async () => {
            global.ClipboardUtils.copyText.mockResolvedValueOnce(true);
            await controller.copyAgent('fusion1', btnMock);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('fusion prompt 1');
        });

        it('fails securely when agent index is invalid', async () => {
            await controller.copyAgent('invalid', btnMock);
            expect(global.ClipboardUtils.copyText).not.toHaveBeenCalled();
        });

        it('fails securely when clipboard throws or returns false', async () => {
            global.ClipboardUtils.copyText.mockResolvedValueOnce(false);
            await controller.copyAgent(0, btnMock);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('core prompt 1');
            expect(appMock.toast.show).not.toHaveBeenCalled();
            expect(global.ClipboardUtils.animateButtonSuccess).not.toHaveBeenCalled();
        });
    });

    describe('downloadCustomAgents', () => {
        it('downloads valid custom agents', () => {
            global.FormatUtils.formatAgentPrompts.mockReturnValueOnce('formatted agents');
            controller.downloadCustomAgents(btnMock);
            expect(global.FormatUtils.formatAgentPrompts).toHaveBeenCalledWith([appMock.customAgents['custom1']]);
            expect(global.DownloadUtils.downloadTextFile).toHaveBeenCalledWith('# Custom Roster\nformatted agents', 'jules_custom_agents.md');
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Downloaded!');
        });

        it('shows toast and aborts if no valid custom agents', () => {
            appMock.customAgents = { 'invalid': { prompt: '' }, 'missing': {} };
            controller.downloadCustomAgents(btnMock);
            expect(appMock.toast.show).toHaveBeenCalledWith('No custom agents available.');
            expect(global.DownloadUtils.downloadTextFile).not.toHaveBeenCalled();
        });

        it('shows toast and aborts if customAgents is null', () => {
            appMock.customAgents = null;
            controller.downloadCustomAgents(btnMock);
            expect(appMock.toast.show).toHaveBeenCalledWith('No custom agents available.');
            expect(global.DownloadUtils.downloadTextFile).not.toHaveBeenCalled();
        });
    });

    describe('downloadAll', () => {
        it('downloads all core agents', () => {
            global.FormatUtils.formatAgentPrompts.mockReturnValueOnce('formatted core agents');
            controller.downloadAll(btnMock);
            expect(global.FormatUtils.formatAgentPrompts).toHaveBeenCalledWith(appMock.agents);
            expect(global.DownloadUtils.downloadTextFile).toHaveBeenCalledWith('# Master Roster\nformatted core agents', 'jules_roster.md');
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Downloaded!');
        });
    });

    describe('copyAll', () => {
        it('copies all core agents successfully', async () => {
            global.FormatUtils.formatAgentPrompts.mockReturnValueOnce('formatted core agents');
            global.ClipboardUtils.copyText.mockResolvedValueOnce(true);
            await controller.copyAll(btnMock);
            expect(global.FormatUtils.formatAgentPrompts).toHaveBeenCalledWith(appMock.agents);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('# Master Roster\nformatted core agents');
            expect(appMock.toast.show).toHaveBeenCalledWith('Copied to clipboard');
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Copied!');
        });

        it('fails securely when clipboard returns false for copyAll', async () => {
            global.FormatUtils.formatAgentPrompts.mockReturnValueOnce('formatted core agents');
            global.ClipboardUtils.copyText.mockResolvedValueOnce(false);
            await controller.copyAll(btnMock);
            expect(global.ClipboardUtils.copyText).toHaveBeenCalledWith('# Master Roster\nformatted core agents');
            expect(appMock.toast.show).not.toHaveBeenCalled();
            expect(global.ClipboardUtils.animateButtonSuccess).not.toHaveBeenCalled();
        });
    });
});
