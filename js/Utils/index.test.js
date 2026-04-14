/**
 * @jest-environment jsdom
 */

describe('Utils Index module exports', () => {
  it('exports gracefully across different environment module definitions', () => {
    const fs = require('fs');
    const code = fs.readFileSync('js/Utils/index.js', 'utf8');

    // Assert exports assign successfully in Node-like environment
    let isExported = false;
    let moduleMock = {
      get exports() { return {}; },
      set exports(val) { isExported = true; }
    };

    // Provide stub requires since we are evaluating via new Function
    const mockRequire = (path) => ({});

    expect(() => {
      new Function('module', 'require', code)(moduleMock, mockRequire);
    }).not.toThrow();
    expect(isExported).toBe(true);

    // Assert safe bypass when module lacks exports property
    expect(() => {
      new Function('module', 'require', code)({}, mockRequire);
    }).not.toThrow();

    // Assert safe bypass when module is strictly undefined and require is undefined (browser-like)
    const mockWindow = {
        AgentUtils: {},
        DOMUtils: {},
        DownloadUtils: {},
        FormatUtils: {},
        PerformanceUtils: {},
        PromptParser: {},
        StorageUtils: {},
        NetworkUtils: {}
    };

    expect(() => {
      new Function('module', 'require', 'window', code)(undefined, undefined, mockWindow);
    }).not.toThrow();
  });

  it('correctly imports and exports expected modules', () => {
    const Utils = require('./index.js');
    expect(Utils.AgentUtils).toBeDefined();
    expect(Utils.DOMUtils).toBeDefined();
    expect(Utils.DownloadUtils).toBeDefined();
    expect(Utils.FormatUtils).toBeDefined();
    expect(Utils.PerformanceUtils).toBeDefined();
    expect(Utils.PromptParser).toBeDefined();
    expect(Utils.StorageUtils).toBeDefined();
    expect(Utils.NetworkUtils).toBeDefined();
  });
});
