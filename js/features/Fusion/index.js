// Export all components from the Fusion feature module
if (typeof window !== "undefined") {
    // Expose to global scope for the vanilla JS environment
    window.FusionCompiler = window.FusionCompiler || typeof FusionCompiler !== 'undefined' ? FusionCompiler : null;
    window.FusionIndex = window.FusionIndex || typeof FusionIndex !== 'undefined' ? FusionIndex : null;
    window.FusionLab = window.FusionLab || typeof FusionLab !== 'undefined' ? FusionLab : null;
}
