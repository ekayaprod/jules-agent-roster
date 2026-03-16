import re

with open('js/Features/Fusion/FusionCompiler.test.js', 'r') as f:
    content = f.read()

content = re.sub(r"  describe\('extractSection', \(\) => \{.*?\n  \}\);\n", "", content, flags=re.DOTALL)
content = re.sub(r"  describe\('extractAgentContent', \(\) => \{.*?\n  \}\);\n", "", content, flags=re.DOTALL)
content = re.sub(r"  describe\('stitch', \(\) => \{.*?\n  \}\);\n", "", content, flags=re.DOTALL)

fuse_desc = re.search(r"  describe\('fuse', \(\) => \{.*?\n  \}\);\n", content, flags=re.DOTALL).group(0)

fuse_desc = re.sub(r"    it\('handles agents without names gracefully', \(\) => \{.*?\}\);\n", """    it('handles agents without names gracefully', () => {
      const fused = compiler.fuse({}, {});
      expect(fused.name).toBe('Error');
    });\n""", fuse_desc, flags=re.DOTALL)

fuse_desc = re.sub(r"    it\('stitches the void dynamic prompt if custom prompt is null', \(\) => \{.*?\}\);\n", """    it('stitches the void dynamic prompt if custom prompt is null', () => {
      const fused = compiler.fuse(
        { name: 'Architect', emoji: '📐', prompt: '' },
        { name: 'Helix', emoji: '🧬', prompt: '' }
      );
      expect(fused.name).toBe('The Void');
      expect(fused.isCustom).toBe(true);
      expect(fused.prompt).toBeNull();
    });\n""", fuse_desc, flags=re.DOTALL)

fuse_desc = re.sub(r"    it\('dynamically stitches normal pairs', \(\) => \{.*?\}\);\n", """    it('returns an error if combination is unknown', () => {
      const fused = compiler.fuse(
        { name: 'Architect', emoji: '📐', prompt: '' },
        { name: 'Janitor', emoji: '🧹', prompt: '' }
      );
      expect(fused.name).toBe('Error');
      expect(fused.prompt).toBe('Invalid agents selected.');
    });\n""", fuse_desc, flags=re.DOTALL)

content = re.sub(r"  describe\('fuse', \(\) => \{.*?\n  \}\);\n", fuse_desc, content, flags=re.DOTALL)

with open('js/Features/Fusion/FusionCompiler.test.js', 'w') as f:
    f.write(content)
