/**
 * @jest-environment jsdom
 */
const PromptParser = require('./prompt-parser');

describe('PromptParser', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns legacy format for null, undefined, or non-string input', () => {
    expect(PromptParser.parsePrompt(null)).toEqual({ format: 'legacy', raw: '' });
    expect(PromptParser.parsePrompt(undefined)).toEqual({ format: 'legacy', raw: '' });
    expect(PromptParser.parsePrompt(123)).toEqual({ format: 'legacy', raw: 123 });
    const obj = {};
    expect(PromptParser.parsePrompt(obj)).toEqual({ format: 'legacy', raw: obj });
  });

  it('returns legacy format for strings without XML markers', () => {
    const rawText = 'Just a regular prompt without XML tags.';
    expect(PromptParser.parsePrompt(rawText)).toEqual({ format: 'legacy', raw: rawText });
  });

  it('returns xml format and parses sections correctly for valid XML input', () => {
    const rawText = `
      <system id="sys1" name="SystemPrompt">System instruction here</system>
      <task>Task description here</task>
      <step>Step 1</step>
      <output>Expected output</output>
      <ignored>This tag is ignored</ignored>
    `;
    const result = PromptParser.parsePrompt(rawText);

    expect(result.format).toBe('xml');
    expect(result.sections).toHaveLength(4);

    expect(result.sections[0]).toEqual({
      tag: 'system',
      content: 'System instruction here',
      id: 'sys1',
      name: 'SystemPrompt'
    });

    expect(result.sections[1]).toEqual({
      tag: 'task',
      content: 'Task description here',
      id: null,
      name: null
    });

    expect(result.sections[2]).toEqual({
      tag: 'step',
      content: 'Step 1',
      id: null,
      name: null
    });

    expect(result.sections[3]).toEqual({
      tag: 'output',
      content: 'Expected output',
      id: null,
      name: null
    });
  });

  it('handles XML with parser errors correctly (returns legacy)', () => {
    // Malformed XML - unclosed tag inside the root
    const rawText = '<system>Unclosed <tag></system>';

    const result = PromptParser.parsePrompt(rawText);

    expect(result.format).toBe('legacy');
    expect(result.raw).toBe(rawText);
  });

  it('catches exceptions during XML parsing with a long string input and returns legacy format', () => {
    // To cover line 75 `input: rawText ? rawText.substring(0, 100) : null,`
    // we provide a VERY long string to cover the substring(0, 100) branch
    const rawText = '<system>' + 'a'.repeat(200) + '</system>';

    const originalDOMParserRef = global.DOMParser;
    global.DOMParser = jest.fn(() => {
      throw new Error('Simulated DOMParser error 2');
    });

    const result = PromptParser.parsePrompt(rawText);

    expect(result.format).toBe('legacy');
    expect(result.raw).toBe(rawText);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'PROMPT_PARSE_FAILED',
        input: rawText.substring(0, 100),
        error: 'Simulated DOMParser error 2'
      })
    );

    global.DOMParser = originalDOMParserRef;
  });

  it('returns legacy if no valid sections are found in XML', () => {
    const rawText = '<system>Just a system tag text with no closing</system>';
    // We inject <system> string to pass the initial regex `/<(system|task|step|output)\b/i.test`
    // but then we make it parse into a structure where it doesn't match ELEMENT_NODE, or
    // we just use <task> text inside a comment.
    const rawText2 = '<!-- <task> --> <unknown>content</unknown>';
    const result = PromptParser.parsePrompt(rawText2);
    expect(result.format).toBe('legacy');
    expect(result.raw).toBe(rawText2);
  });

  it('catches exceptions during XML parsing, logs error, and returns legacy format', () => {
    const rawText = '<system>Valid tag</system>';

    // Simulate an exception during parsing
    const originalDOMParserRef = global.DOMParser;
    global.DOMParser = jest.fn(() => {
      throw new Error('Simulated DOMParser error');
    });

    const result = PromptParser.parsePrompt(rawText);

    expect(result.format).toBe('legacy');
    expect(result.raw).toBe(rawText);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'PROMPT_PARSE_FAILED',
        input: rawText,
        error: 'Simulated DOMParser error'
      })
    );

    global.DOMParser = originalDOMParserRef;
  });
});
