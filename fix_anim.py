import re

with open('js/Features/Fusion/FusionAnimation.js', 'r') as f:
    content = f.read()

anim_replacement = """    if (animResult) animResult.innerHTML = `<span class="highlight">${safeDisplayName}</span> ${icon}`;

    if (iconResult) iconResult.innerHTML = icon;

    DOMUtils.setButtonState(fuseBtn, "disabled", fuseBtn.innerText);"""

content = re.sub(r'    if \(animResult\) animResult\.innerHTML = `<span class="highlight">\$\{safeDisplayName\}</span> \$\{icon\}`;.*?DOMUtils\.setButtonState\(fuseBtn, "disabled", fuseBtn\.innerText\);', anim_replacement, content, flags=re.DOTALL)

with open('js/Features/Fusion/FusionAnimation.js', 'w') as f:
    f.write(content)
