/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');
const { MESSAGES } = require('../../constants/ui.js');
global.MESSAGES = MESSAGES;

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

global.PromptParser = {
    stripFrontmatter: jest.fn(str => str)
};

global.FormatUtils = {
    CUSTOM_ROSTER_HEADER: '# Custom Roster\n',
    MASTER_ROSTER_HEADER: '# Master Roster\n',
    formatAgentPrompts: jest.fn()
};

global.DownloadUtils = {
    downloadTextFile: jest.fn()
};

describe('ExportController - Inspector Boundary Tests', () => {
    const buildMockEnv = () => {
        const appMock = {
            agents: [{ name: 'Core Agent', prompt: 'core prompt 1' }],
            customAgents: {
                'custom1': { name: 'Custom Agent', prompt: 'custom prompt 1' },
                'custom2': { name: 'Empty Agent', prompt: '' }
            },
            fusionLab: {
                compiler: {
                    customAgentsMap: {
                        'fusion1': { name: 'Fusion Agent', prompt: 'fusion prompt 1' }
                    },
                    fusionMatrixMap: {
                        'ParentA,ParentB': 'fusion1',
                        'ParentC,ParentD': 'fusion2'
                    }
                }
            },
            toast: {
                show: jest.fn()
            },
            agentRepo: {
                fetchPrompt: jest.fn().mockResolvedValue('fetched mock prompt')
            },
            getAgentForUI: jest.fn(function(index) {
                return this.agents[index] || (this.customAgents && this.customAgents[index]) || (this.fusionLab && this.fusionLab.compiler.customAgentsMap[index]);
            })
        };
        const btnMock = document.createElement('button');
        const controller = new ExportController(appMock);

        const { AgentUtils } = require('../../Utils');
        global.AgentUtils = AgentUtils;

        jest.clearAllMocks();

        return { appMock, btnMock, controller };
    };

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('downloadAgent', () => {
        it('downloads a valid agent and formats the filename correctly', async () => {
            const { btnMock, controller } = buildMockEnv();
            await controller.downloadAgent(0, btnMock);

            expect(global.DownloadUtils.downloadTextFile).toHaveBeenCalledWith(
                'core prompt 1',
                'core_agent_protocol.md'
            );
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Downloaded!');
        });

        it('aborts gracefully if agent is not found', async () => {
            const { btnMock, controller } = buildMockEnv();
            await controller.downloadAgent('invalid_agent', btnMock);

            expect(global.DownloadUtils.downloadTextFile).not.toHaveBeenCalled();
            expect(global.ClipboardUtils.animateButtonSuccess).not.toHaveBeenCalled();
        });
    });

    describe('downloadCustomAgentsByParent', () => {
        it('downloads custom agents filtered by parent name', async () => {
            const { btnMock, controller, appMock } = buildMockEnv();
            global.FormatUtils.formatAgentPrompts.mockReturnValueOnce('formatted filtered agents');

            await controller.downloadCustomAgentsByParent('ParentA', btnMock);

            expect(global.FormatUtils.formatAgentPrompts).toHaveBeenCalledWith([
                appMock.fusionLab.compiler.customAgentsMap['fusion1']
            ]);
            expect(global.DownloadUtils.downloadTextFile).toHaveBeenCalledWith(
                '# Custom Roster\nformatted filtered agents',
                'jules_custom_agents_parenta.md'
            );
            expect(global.ClipboardUtils.animateButtonSuccess).toHaveBeenCalledWith(btnMock, 'Downloaded!');
        });

        it('aborts gracefully if no parentName provided', async () => {
            const { btnMock, controller } = buildMockEnv();
            await controller.downloadCustomAgentsByParent(null, btnMock);
            expect(global.DownloadUtils.downloadTextFile).not.toHaveBeenCalled();
        });

        it('shows toast if no exportable agents are found for parent', async () => {
            const { btnMock, controller, appMock } = buildMockEnv();
            await controller.downloadCustomAgentsByParent('UnknownParent', btnMock);
            expect(appMock.toast.show).toHaveBeenCalledWith('No unlocked fusions found for this agent.');
            expect(global.DownloadUtils.downloadTextFile).not.toHaveBeenCalled();
        });
    });
});
