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
      global.window.rosterApp = { showToast: jest.fn() };
      global.DOMUtils = { setButtonState: jest.fn() };
    });

    afterEach(() => {
      delete global.fetch;
      delete global.window.rosterApp;
      delete global.DOMUtils;
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

    it('should handle fetch failure gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      builder.init();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await builder.handleForge();

      expect(consoleSpy).toHaveBeenCalledWith('Unable to forge bespoke agent:', expect.any(Error));
      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith(expect.stringContaining('Unable to forge bespoke agent:'));
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
    });

    it('should handle missing template response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      builder.init();
      await builder.handleForge();

      expect(global.window.rosterApp.showToast).toHaveBeenCalledWith('Unable to load the Singularity template. Please try again.');
      expect(mockTerminal.launchSession).not.toHaveBeenCalled();
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

    window.TelemetryUtils = { dispatchEvent: jest.fn() };
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    builder.julesTerminal = null;
    builder.init();
    await builder.handleForge();

    expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("BUILDER_MISSING_TERMINAL", expect.any(Error));

    delete window.TelemetryUtils;
    delete global.fetch;
    consoleWarnSpy.mockRestore();
  });

  it('should dispatch BUILDER_FORGE_ERROR error if TelemetryUtils is available and fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Failure'));

    window.TelemetryUtils = { dispatchEvent: jest.fn() };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    builder.init();
    await builder.handleForge();

    expect(window.TelemetryUtils.dispatchEvent).toHaveBeenCalledWith("BUILDER_FORGE_ERROR", expect.any(Error));

    delete window.TelemetryUtils;
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
    await builder.handleForge();

    expect(consoleWarnSpy).toHaveBeenCalledWith("Singularity Builder: julesTerminal instance is missing.");

    delete global.fetch;
  });
});

describe('SingularityBespokeBuilder - Global Export Bounds', () => {
  it('should export cleanly via module.exports if defined', () => {
    expect(typeof module !== 'undefined' && module.exports).toBeTruthy();
    expect(SingularityBespokeBuilder).toBeDefined();
  });
});
