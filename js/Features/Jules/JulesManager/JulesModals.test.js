const JulesModals = require('./JulesModals');

describe('JulesModals', () => {
    let modals, manager, prMock;
    let elements = {};

    beforeEach(() => {
        prMock = {
            number: 123,
            title: 'Test PR',
            html_url: 'https://github.com/test/test/pull/123',
            body: 'Test body'
        };

        elements = {
            julesPRModal: document.createElement('div'),
            prModalTitleText: document.createElement('div'),
            prModalExternalLink: document.createElement('a'),
            prModalContent: document.createElement('div'),
            prModalError: document.createElement('div'),
            mergePRBtn: document.createElement('button'),
            closePRBtn: document.createElement('button'),
            cancelPRBtn: document.createElement('button'),
            julesInteractionModal: document.createElement('div'),
            cancelInteractionBtn: document.createElement('button'),
            submitInteractionBtn: document.createElement('button'),
            interactionModalInput: document.createElement('input'),
            interactionModalError: document.createElement('span'),
        };

        manager = {
            getEl: jest.fn((id) => elements[id]),
            app: { toast: { show: jest.fn() } },
            loadPullRequestsForRepo: jest.fn(),
            activeModalSessionId: null
        };

        window.julesService = {
            mergePullRequest: jest.fn(),
            closePullRequest: jest.fn(),
            sendUserInput: jest.fn()
        };

        global.DOMUtils = {
            createMarkdownPreBlock: jest.fn().mockReturnValue(document.createElement('pre')),
            setButtonState: jest.fn()
        };

        modals = new JulesModals(manager);
    });

    describe('_initPRModal', () => {
        it('should attach event listener to closePRModalBtn', () => {
            modals._initPRModal();
            elements.julesPRModal.classList.add('visible');
            elements.cancelPRBtn.dispatchEvent(new MouseEvent('click'));
            expect(elements.julesPRModal.classList.contains('visible')).toBe(false);
        });

        it('should handle missing elements gracefully', () => {
            manager.getEl.mockReturnValue(null);
            expect(() => modals._initPRModal()).not.toThrow();
        });
    });

    describe('_showPRModal', () => {
        it('should bail if modal is missing', () => {
            elements.julesPRModal = null;
            modals._showPRModal(prMock, 'repo');
            expect(elements.prModalTitleText.textContent).toBe('');
        });

        it('should populate modal and show it', () => {
            modals._showPRModal(prMock, 'repo');
            expect(elements.prModalTitleText.textContent).toBe('#123 Test PR');
            expect(elements.prModalExternalLink.href).toBe('https://github.com/test/test/pull/123');
            expect(elements.prModalContent.innerHTML).toBe('<pre></pre>');
            expect(elements.prModalError.textContent).toBe('');
            expect(elements.prModalError.classList.contains('hidden')).toBe(true);
            expect(elements.julesPRModal.classList.contains('visible')).toBe(true);
        });

        it('should handle missing pr.body', () => {
            prMock.body = null;
            modals._showPRModal(prMock, 'repo');
            expect(global.DOMUtils.createMarkdownPreBlock).toHaveBeenCalledWith('No description provided.');
        });

        it('should handle missing merge PR button gracefully', () => {
            elements.mergePRBtn = null;
            modals._showPRModal(prMock, 'repo');
            expect(elements.prModalTitleText.textContent).toBe('#123 Test PR');
        });

        it('should handle missing close PR button gracefully', () => {
            elements.closePRBtn = null;
            modals._showPRModal(prMock, 'repo');
            expect(elements.prModalTitleText.textContent).toBe('#123 Test PR');
        });

        it('should handle merge PR success', async () => {
            window.julesService.mergePullRequest.mockResolvedValue();
            modals._showPRModal(prMock, 'repo');

            await elements.mergePRBtn.dispatchEvent(new MouseEvent('click'));

            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.mergePRBtn, "loading", "Merging...");
            expect(window.julesService.mergePullRequest).toHaveBeenCalledWith('repo', 123);
            expect(manager.app.toast.show).toHaveBeenCalledWith('Successfully merged PR #123', 'success');
            expect(elements.julesPRModal.classList.contains('visible')).toBe(false);
            expect(manager.loadPullRequestsForRepo).toHaveBeenCalledWith('repo');
        });

        it('should handle merge PR failure and show error', async () => {
            window.julesService.mergePullRequest.mockRejectedValue(new Error('Merge conflict'));
            modals._showPRModal(prMock, 'repo');

            await elements.mergePRBtn.dispatchEvent(new MouseEvent('click'));

            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.mergePRBtn, "ready", "Merge PR");
            expect(elements.prModalError.textContent).toBe('Failed to merge PR: Merge conflict');
            expect(elements.prModalError.classList.contains('hidden')).toBe(false);
        });

        it('should handle close PR success', async () => {
            window.julesService.closePullRequest.mockResolvedValue();
            modals._showPRModal(prMock, 'repo');

            await elements.closePRBtn.dispatchEvent(new MouseEvent('click'));

            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.closePRBtn, "loading", "Closing...");
            expect(window.julesService.closePullRequest).toHaveBeenCalledWith('repo', 123);
            expect(manager.app.toast.show).toHaveBeenCalledWith('Successfully closed PR #123', 'success');
            expect(elements.julesPRModal.classList.contains('visible')).toBe(false);
            expect(manager.loadPullRequestsForRepo).toHaveBeenCalledWith('repo');
        });

        it('should handle close PR failure and show error', async () => {
            window.julesService.closePullRequest.mockRejectedValue(new Error('Close error'));
            modals._showPRModal(prMock, 'repo');

            await elements.closePRBtn.dispatchEvent(new MouseEvent('click'));

            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.closePRBtn, "ready", "Close PR");
            expect(elements.prModalError.textContent).toBe('Failed to close PR: Close error');
            expect(elements.prModalError.classList.contains('hidden')).toBe(false);
        });

        it('should handle missing buttons and error element gracefully on merge/close errors', async () => {
            elements.prModalError = null;
            window.julesService.mergePullRequest.mockRejectedValue(new Error('Merge error'));
            window.julesService.closePullRequest.mockRejectedValue(new Error('Close error'));

            modals._showPRModal(prMock, 'repo');

            await elements.mergePRBtn.dispatchEvent(new MouseEvent('click'));
            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.mergePRBtn, "ready", "Merge PR");

            await elements.closePRBtn.dispatchEvent(new MouseEvent('click'));
            expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(elements.closePRBtn, "ready", "Close PR");
        });
    });

    describe('_initInteractionModal', () => {
        it('should return if modal is missing', () => {
            elements.julesInteractionModal = null;
            modals._initInteractionModal();
            expect(elements.cancelInteractionBtn.onclick).toBeNull();
        });

        it('should validate empty input on submit', () => {
            modals._initInteractionModal();
            elements.interactionModalInput.value = '   ';
            elements.submitInteractionBtn.dispatchEvent(new MouseEvent('click'));
            expect(elements.interactionModalInput.style.borderColor).toBe('#ef4444');
            expect(elements.interactionModalError.textContent).toBe('Please provide a response before transmitting.');
        });

        it('should clear validation error on input', () => {
            modals._initInteractionModal();
            elements.interactionModalInput.value = '   ';
            elements.submitInteractionBtn.dispatchEvent(new MouseEvent('click'));
            expect(elements.interactionModalInput.style.borderColor).toBe('#ef4444');

            elements.interactionModalInput.dispatchEvent(new Event('input'));
            expect(elements.interactionModalInput.style.borderColor).toBe('');
            expect(elements.interactionModalError.classList.contains('hidden')).toBe(true);
        });

        it('should handleSubmit successfully and send reply', async () => {
            modals._initInteractionModal();
            manager.activeModalSessionId = '123';
            elements.interactionModalInput.value = 'my response';

            const statusSpan = document.createElement('span');
            statusSpan.id = 'status-123';
            document.body.appendChild(statusSpan);

            window.julesService.sendUserInput.mockResolvedValue();

            await elements.submitInteractionBtn.dispatchEvent(new MouseEvent('click'));

            expect(window.julesService.sendUserInput).toHaveBeenCalledWith('123', 'my response');
            expect(manager.app.toast.show).toHaveBeenCalledWith('Reply transmitted.', 'success');
            document.body.removeChild(statusSpan);
        });
    });

    // We can add coverage for history modal and key error methods here if needed, but since PR focus is the main task
    // we have extensive PR tests.
});
