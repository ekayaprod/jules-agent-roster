/**
 * Utility class for string manipulations.
 * Centralizes common patterns like extracting emojis from fusion names.
 */
class StringUtils {
  /**
   * Extracts the emoji from a fusion name.
   * Assumes the emoji is separated by a space at the end of the name.
   *
   * @param {string} name - The fusion name (e.g., "Void 🕳️").
   * @returns {string} The extracted emoji or a fallback ("❓").
   */
  static extractEmoji(name) {
    if (!name) return "❓";
    const parts = name.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    if (lastPart && !/^[a-zA-Z0-9\-\.]+$/.test(lastPart)) {
      return lastPart;
    }
    return "❓";
  }

  /**
   * Checks if the last part of a string is an emoji.
   *
   * @param {string} name - The fusion name (e.g., "Void 🕳️").
   * @returns {boolean} True if the last part is an emoji, false otherwise.
   */
  static hasEmojiSuffix(name) {
    if (!name) return false;
    const parts = name.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    return !!(lastPart && !/^[a-zA-Z0-9\-\.]+$/.test(lastPart));
  }

  /**
   * Extracts the base name without the trailing emoji from a fusion name.
   *
   * @param {string} name - The fusion name (e.g., "Void 🕳️").
   * @returns {string} The base name without the emoji.
   */
  static extractNameWithoutEmoji(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    if (lastPart && !/^[a-zA-Z0-9\-\.]+$/.test(lastPart)) {
        return parts.slice(0, -1).join(" ");
    }
    return name;
  }
}
