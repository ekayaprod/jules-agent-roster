#!/bin/bash
git checkout prompts/fusions/Rumble.md
sed -i 's/^forge_version: V81.0/forge_version: V85.4/' prompts/fusions/Rumble.md
sed -i 's/^1. \*\*Proactive Touchpoints:\*\*/  1. **Proactive Touchpoints:**/' prompts/fusions/Rumble.md
sed -i 's/^2. \*\*Wrap-Up Checkpoints:\*\*/  2. **Wrap-Up Checkpoints:**/' prompts/fusions/Rumble.md
sed -i 's/^3. \*\*Managed Interruption:\*\*/  3. **Managed Interruption:**/' prompts/fusions/Rumble.md
