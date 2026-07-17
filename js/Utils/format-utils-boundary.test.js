/**
 * @jest-environment jsdom
 */

const FormatUtils = require('./format-utils');

describe('FormatUtils Boundary Stress-Tests', () => {
    describe('extractDisplayName', () => {
        it('throws an error when agent.name is an integer, exposing missing type-safety', () => {
            expect(() => {
                FormatUtils.extractDisplayName({ name: 12345 });
            }).toThrow(TypeError);
        });
    });

    describe('extractRepoPath', () => {
        it('throws an error when sourceName is an integer, exposing missing type-safety', () => {
            expect(() => {
                FormatUtils.extractRepoPath(12345);
            }).toThrow(TypeError);
        });
    });
});
