const SingularityBespokeBuilder = require('./SingularityBespokeBuilder');

describe('SingularityBespokeBuilder', () => {
  let builder;
  let mockTerminal;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'singularityBuilderContainer';
    document.body.appendChild(container);

    mockTerminal = {
      launchSession: jest.fn(),
    };

    builder = new SingularityBespokeBuilder(mockTerminal);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('init', () => {
    it('should bail if container does not exist', () => {
      document.body.innerHTML = ''; // Remove container

      // Need to manually set container to null because the constructor sets it once
      builder.container = null;

      const renderSpy = jest.spyOn(builder, 'render');
      builder.init();
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should render and bind events if container exists', () => {
      const renderSpy = jest.spyOn(builder, 'render');
      const bindEventsSpy = jest.spyOn(builder, 'bindEvents');
      builder.init();
      expect(renderSpy).toHaveBeenCalled();
      expect(bindEventsSpy).toHaveBeenCalled();
    });

    it('should toggle header expansion on click', () => {
      builder.init();
      const headerToggle = document.getElementById("sgHeaderToggle");
      const forgeContainer = document.getElementById("sgForgeContainer");

      expect(forgeContainer.classList.contains("expanded")).toBe(false);

      headerToggle.dispatchEvent(new Event('click'));
      expect(forgeContainer.classList.contains("expanded")).toBe(true);
      expect(headerToggle.getAttribute("aria-expanded")).toBe("true");

      headerToggle.dispatchEvent(new Event('click'));
      expect(forgeContainer.classList.contains("expanded")).toBe(false);
      expect(headerToggle.getAttribute("aria-expanded")).toBe("false");
    });

    it('should toggle header expansion on Enter or Space keydown', () => {
      builder.init();
      const headerToggle = document.getElementById("sgHeaderToggle");
      const forgeContainer = document.getElementById("sgForgeContainer");

      expect(forgeContainer.classList.contains("expanded")).toBe(false);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');
      headerToggle.dispatchEvent(enterEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(forgeContainer.classList.contains("expanded")).toBe(true);

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      headerToggle.dispatchEvent(spaceEvent);

      expect(forgeContainer.classList.contains("expanded")).toBe(false);

      // Other keys should not toggle
      const otherEvent = new KeyboardEvent('keydown', { key: 'a' });
      headerToggle.dispatchEvent(otherEvent);
      expect(forgeContainer.classList.contains("expanded")).toBe(false);
    });
  });

  describe('render', () => {
    it('should inject UI template into container', () => {
      builder.init();
      expect(container.querySelector('#sgMission')).not.toBeNull();
      expect(container.querySelector('#sgSubmit')).not.toBeNull();
    });
  });

  describe('handleForge', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      window.rosterApp = { showToast: jest.fn() };
      global.DOMUtils = { setButtonState: jest.fn() };
    });

    afterEach(() => {
      delete global.fetch;
      delete window.rosterApp;
      delete global.DOMUtils;
    });

    it('should reject empty mission and show validation error UI', async () => {
      builder.init();
      builder.elements.missionInput.value = '';

      await builder.handleForge();

      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
      expect(builder.elements.errorWrapper.classList.contains('hidden')).toBe(false);
      expect(builder.elements.errorText.innerText).toBe('Mission statement is required.');
      expect(builder.elements.missionInput.classList.contains('border-error')).toBe(true);
    });

    it('should reject excessively long mission and show validation error UI', async () => {
      builder.init();
      builder.elements.missionInput.value = 'a'.repeat(501);

      await builder.handleForge();

      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
      expect(builder.elements.errorWrapper.classList.contains('hidden')).toBe(false);
      expect(builder.elements.errorText.innerText).toBe('Mission statement is too long.');
      expect(builder.elements.missionInput.classList.contains('border-error')).toBe(true);
    });

    it('should handle successful forge request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Template with {{UI_MISSION_STATEMENT}}'),
      });

      builder.init();
      builder.elements.missionInput.value = 'Test Mission';

      await builder.handleForge();

      expect(mockTerminal.launchSession).toHaveBeenCalled();
      const payload = mockTerminal.launchSession.mock.calls[0][0];
      expect(payload.prompt).toContain('Test Mission');
    });

    it('should handle successful forge request via NetworkUtils if available', async () => {
      global.NetworkUtils = {
        fetchWithRetry: jest.fn().mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('Template with {{UI_MISSION_STATEMENT}} via NetworkUtils'),
        })
      };

      builder.init();
      builder.elements.missionInput.value = 'Test Mission NetworkUtils';

      await builder.handleForge();

      expect(global.NetworkUtils.fetchWithRetry).toHaveBeenCalledWith("js/Features/Singularity/Singularity.md", { throwOn404: false });
      expect(mockTerminal.launchSession).toHaveBeenCalled();
      const payload = mockTerminal.launchSession.mock.calls[0][0];
      expect(payload.prompt).toContain('Test Mission NetworkUtils');
      expect(payload.prompt).toContain('via NetworkUtils');

      delete global.NetworkUtils;
    });

    it('should handle NetworkUtils fetch failure gracefully', async () => {
      global.NetworkUtils = {
        fetchWithRetry: jest.fn().mockRejectedValueOnce(new Error('NetworkUtils error'))
      };

      builder.init();
      global.window.TelemetryUtils = { dispatchEvent: jest.fn() };
      builder.elements.missionInput.value = 'Valid Mission NetworkUtils Fail';
      await builder.handleForge();

      expect(global.window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('BUILDER_FORGE_ERROR', expect.any(Error));
      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith(expect.stringContaining('Failed to forge bespoke agent:'));
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();

      delete global.NetworkUtils;
      delete global.window.TelemetryUtils;
    });

    it('should handle fetch failure gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      builder.init();
      global.window.TelemetryUtils = { dispatchEvent: jest.fn() };
      builder.elements.missionInput.value = 'Valid Mission';
      await builder.handleForge();

      expect(global.window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith('BUILDER_FORGE_ERROR', expect.any(Error));
      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith(expect.stringContaining('Failed to forge bespoke agent:'));
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();

      delete global.window.TelemetryUtils;
    });

    it('should handle missing template response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      builder.init();
      builder.elements.missionInput.value = 'Valid Mission';
      await builder.handleForge();

      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith('Failed to load the Singularity template. Try again.');
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
    });

    it('should handle terminal launchSession failure gracefully when UI elements are missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Template with {{UI_MISSION_STATEMENT}}'),
      });

      mockTerminal.launchSession.mockImplementation(() => {
        throw new Error('Launch failed');
      });

      builder.init();
      builder.elements.missionInput.value = 'Failing Mission';
      // To test the catch block missing UI elements condition, we need to let the handleForge proceed past the initial mission check.
      // We will override them right before they are checked in the catch block by doing it in the mock Terminal execution.
      mockTerminal.launchSession.mockImplementation(() => {
        builder.elements.errorWrapper = null;
        builder.elements.missionInput = null;
        throw new Error('Launch failed');
      });

      await builder.handleForge();

      expect(mockTerminal.launchSession).toHaveBeenCalled();
      expect(builder.elements.submitBtn.innerHTML).toBe('🌌 Forge Bespoke Agent');
      expect(builder.elements.submitBtn.disabled).toBe(false);
    });

    it('should handle terminal launchSession failure and show error UI', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Template with {{UI_MISSION_STATEMENT}}'),
      });

      mockTerminal.launchSession.mockImplementation(() => {
        throw new Error('Launch failed');
      });

      builder.init();
      builder.elements.missionInput.value = 'Failing Mission';

      const focusSpy = jest.spyOn(builder.elements.missionInput, 'focus');

      await builder.handleForge();

      expect(mockTerminal.launchSession).toHaveBeenCalled();

      expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(builder.elements.submitBtn, 'ready', "🌌 Forge Bespoke Agent");
      expect(builder.elements.errorWrapper.classList.contains('hidden')).toBe(false);
      expect(builder.elements.errorText.innerText).toBe('Launch failed');
      expect(builder.elements.missionInput.classList.contains('border-error')).toBe(true);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should handle terminal launchSession failure and show default error UI when error has no message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Template with {{UI_MISSION_STATEMENT}}'),
      });

      mockTerminal.launchSession.mockImplementation(() => {
        throw new Error();
      });

      builder.init();
      builder.elements.missionInput.value = 'Failing Mission';

      const focusSpy = jest.spyOn(builder.elements.missionInput, 'focus');

      await builder.handleForge();

      expect(mockTerminal.launchSession).toHaveBeenCalled();

      expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(builder.elements.submitBtn, 'ready', "🌌 Forge Bespoke Agent");
      expect(builder.elements.errorWrapper.classList.contains('hidden')).toBe(false);
      expect(builder.elements.errorText.innerText).toBe('Failed to forge agent. Try again.');
      expect(builder.elements.missionInput.classList.contains('border-error')).toBe(true);
      expect(focusSpy).toHaveBeenCalled();
    });
  });
});

describe('SingularityBespokeBuilder - Edge Cases', () => {
  let builder;
  let mockTerminal;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'singularityBuilderContainer';
    document.body.appendChild(container);

    mockTerminal = {
      launchSession: jest.fn(),
    };

    builder = new SingularityBespokeBuilder(mockTerminal);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('should dispatch BUILDER_MISSING_TERMINAL error if TelemetryUtils is available', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Template'),
    });

    global.window.TelemetryUtils = { dispatchEvent: jest.fn() };
    global.DOMUtils = { setButtonState: jest.fn() };
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    builder.julesTerminal = null;
    builder.init();
      builder.elements.missionInput.value = 'Valid Mission';
      await builder.handleForge();

    expect(global.DOMUtils.setButtonState).toHaveBeenCalledWith(builder.elements.submitBtn, 'ready', "🌌 Forge Bespoke Agent");
    expect(global.window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("BUILDER_MISSING_TERMINAL", expect.any(Error));

    delete global.window.TelemetryUtils;
    delete global.DOMUtils;
    delete global.fetch;
    consoleWarnSpy.mockRestore();
  });

  it('should dispatch BUILDER_FORGE_ERROR error if TelemetryUtils is available and fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Failure'));

    global.window.TelemetryUtils = { dispatchEvent: jest.fn() };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    builder.init();
      builder.elements.missionInput.value = 'Valid Mission';
      await builder.handleForge();

    expect(global.window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("BUILDER_FORGE_ERROR", expect.any(Error));

    delete global.window.TelemetryUtils;
    delete global.fetch;
    consoleErrorSpy.mockRestore();
  });

  it('should not throw if julesTerminal is null', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Template'),
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    builder.julesTerminal = null;
    builder.init();
      builder.elements.missionInput.value = 'Valid Mission';
      await builder.handleForge();

    expect(consoleWarnSpy).not.toHaveBeenCalledWith("Singularity Builder: julesTerminal instance is missing.");

    delete global.fetch;
  });
});

describe('SingularityBespokeBuilder - Global Export Bounds', () => {
  it('should export cleanly via module.exports if defined', () => {
    expect(typeof module !== 'undefined' && module.exports).toBeTruthy();
    expect(SingularityBespokeBuilder).toBeDefined();
  });
});
