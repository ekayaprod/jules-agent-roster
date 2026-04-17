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
    expect(Utils.AgentUtils).not.toBeUndefined();
    expect(typeof Utils.AgentUtils === 'object' || typeof Utils.AgentUtils === 'function').toBe(true);
    expect(Utils.DOMUtils).not.toBeUndefined();
    expect(typeof Utils.DOMUtils === 'object' || typeof Utils.DOMUtils === 'function').toBe(true);
    expect(Utils.DownloadUtils).not.toBeUndefined();
    expect(typeof Utils.DownloadUtils === 'object' || typeof Utils.DownloadUtils === 'function').toBe(true);
    expect(Utils.FormatUtils).not.toBeUndefined();
    expect(typeof Utils.FormatUtils === 'object' || typeof Utils.FormatUtils === 'function').toBe(true);
    expect(Utils.PerformanceUtils).not.toBeUndefined();
    expect(typeof Utils.PerformanceUtils === 'object' || typeof Utils.PerformanceUtils === 'function').toBe(true);
    expect(Utils.PromptParser).not.toBeUndefined();
    expect(typeof Utils.PromptParser === 'object' || typeof Utils.PromptParser === 'function').toBe(true);
    expect(Utils.StorageUtils).not.toBeUndefined();
    expect(typeof Utils.StorageUtils === 'object' || typeof Utils.StorageUtils === 'function').toBe(true);
    expect(Utils.NetworkUtils).not.toBeUndefined();
    expect(typeof Utils.NetworkUtils === 'object' || typeof Utils.NetworkUtils === 'function').toBe(true);
  });
});
