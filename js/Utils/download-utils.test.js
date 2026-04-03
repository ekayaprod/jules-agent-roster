/**
 * @jest-environment jsdom
 */

const DownloadUtils = require('./download-utils');

describe('DownloadUtils', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockAppendChild;
    let mockRemoveChild;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;

    beforeEach(() => {
        // Mock URL methods
        mockCreateObjectURL = jest.fn(() => 'mock-url');
        mockRevokeObjectURL = jest.fn();

        originalCreateObjectURL = global.URL.createObjectURL;
        originalRevokeObjectURL = global.URL.revokeObjectURL;

        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        // Mock DOM methods on document.body
        mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore globals and mocks
        global.URL.createObjectURL = originalCreateObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL;
        jest.restoreAllMocks();
    });

    it('downloads a text file with default type', () => {
        // Mock createElement to capture the anchor tag
        const mockAnchor = {
            click: jest.fn(),
            href: '',
            download: ''
        };
        const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

        const content = 'Hello, World!';
        const filename = 'test.md';

        // Execute
        DownloadUtils.downloadTextFile(content, filename);

        // Assert Blob creation
        // We can't directly assert the Blob content easily in jsdom, but we can verify it was called
        expect(mockCreateObjectURL).toHaveBeenCalled();

        // Assert anchor setup
        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockAnchor.href).toBe('mock-url');
        expect(mockAnchor.download).toBe(filename);

        // Assert DOM manipulation and click
        expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);

        // Assert cleanup
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('downloads a text file with a custom MIME type', () => {
        const mockAnchor = {
            click: jest.fn(),
            href: '',
            download: ''
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

        const content = '{"key": "value"}';
        const filename = 'data.json';
        const mimeType = 'application/json';

        // Execute
        DownloadUtils.downloadTextFile(content, filename, mimeType);

        // Verify URL creation was triggered
        expect(mockCreateObjectURL).toHaveBeenCalled();

        // Verify anchor attributes
        expect(mockAnchor.download).toBe(filename);
        expect(mockAnchor.href).toBe('mock-url');

        // Verify execution flow
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('handles empty content safely without crashing', () => {
        const mockAnchor = { click: jest.fn() };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

        expect(() => {
            DownloadUtils.downloadTextFile('', 'empty.txt');
        }).not.toThrow();

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('handles null and undefined filename gracefully', () => {
        const mockAnchor = { click: jest.fn() };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

        DownloadUtils.downloadTextFile('content', null);
        expect(mockAnchor.download).toBe(null);

        DownloadUtils.downloadTextFile('content', undefined);
        expect(mockAnchor.download).toBe(undefined);
    });

    it('survives missing arguments (boundary assault)', () => {
        const mockAnchor = { click: jest.fn() };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

        expect(() => {
            DownloadUtils.downloadTextFile();
        }).not.toThrow();

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockAnchor.click).toHaveBeenCalled();
    });
});
