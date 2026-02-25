/**
 * Utility class for handling file download operations.
 * Centralizes logic previously duplicated in RosterApp.
 */
class DownloadUtils {
    /**
     * Triggers a download of a text file.
     * @param {string} content - The content of the file.
     * @param {string} filename - The name of the file to download.
     * @param {string} [type="text/markdown"] - The MIME type of the file.
     */
    static downloadTextFile(content, filename, type = "text/markdown") {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
