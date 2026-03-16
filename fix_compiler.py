with open('js/Features/Fusion/FusionCompiler.js', 'r') as f:
    content = f.read()

import re

content = re.sub(r'  let parsed = null;.*?    };\n  };\n\n  \n', '', content, flags=re.DOTALL)

with open('js/Features/Fusion/FusionCompiler.js', 'w') as f:
    f.write(content)
