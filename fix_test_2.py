with open('js/Features/Fusion/FusionCompiler.test.js', 'r') as f:
    content = f.read()

content = content.replace("    });\n      expect(fused.name).toBe('undefinedundefined undefined-undefined Fusion');\n    });\n", "    });\n")

with open('js/Features/Fusion/FusionCompiler.test.js', 'w') as f:
    f.write(content)
