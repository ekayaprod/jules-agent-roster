/**
 * @jest-environment jsdom
 */

const FormatUtils = require('./format-utils');

describe('FormatUtils Boundary Stress-Tests', () => {
    describe('extractDisplayName', () => {
        it.failing('should safely cast integers to strings without throwing', () => {
            expect(FormatUtils.extractDisplayName({ name: 12345 })).toBe('12345');
        });
    });

    describe('extractRepoPath', () => {
        it.failing('should safely cast integers to strings without throwing', () => {
            expect(FormatUtils.extractRepoPath(12345)).toBe('12345');
        });
    });
});
