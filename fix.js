const fs = require('fs');
let content = fs.readFileSync('js/Features/Fusion/FusionLab.test.js', 'utf8');

const testToAdd = `
    test('handleFusion gracefully handles fusionIndex unlock exception', async () => {
        fusionLab.state.slotA = { name: 'A' };
        fusionLab.state.slotB = { name: 'B' };
        fusionLab.fusionIndex.customAgents['A,B'] = true;

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        fusionLab.fusionIndex.unlock.mockImplementation(() => {
            throw new Error('Unlock failure');
        });

        const fusedAgent = { name: 'C' };
        fusionLab.compiler.fuse.mockReturnValue(fusedAgent);

        fusionLab.animation = { runAnimation: jest.fn() };
        fusionLab.renderFusionResult = jest.fn();

        await fusionLab.handleFusion();

        expect(consoleSpy).toHaveBeenCalledWith("FusionLab: Failed to unlock index", expect.any(Error));
        expect(fusionLab.renderFusionResult).toHaveBeenCalledWith(fusedAgent);
        expect(fusionLab.animation.runAnimation).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
`;

// Insert the test right before the last closing bracket and brace
content = content.replace(/}\);\s*$/, testToAdd + '\n});\n');
fs.writeFileSync('js/Features/Fusion/FusionLab.test.js', content);
