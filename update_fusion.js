const fs = require('fs');

let cssContent = fs.readFileSync('js/features/fusion/fusion.css', 'utf8');

cssContent = cssContent.replace(/translateX\(-150px\)/g, 'translateX(-9.375rem)');
cssContent = cssContent.replace(/translateX\(-30px\)/g, 'translateX(-1.875rem)');
cssContent = cssContent.replace(/translateX\(150px\)/g, 'translateX(9.375rem)');
cssContent = cssContent.replace(/translateX\(30px\)/g, 'translateX(1.875rem)');

cssContent = cssContent.replace(/translate\(-5px, 5px\)/g, 'translate(-0.3125rem, 0.3125rem)');
cssContent = cssContent.replace(/translate\(5px, -5px\)/g, 'translate(0.3125rem, -0.3125rem)');
cssContent = cssContent.replace(/translate\(-5px, -5px\)/g, 'translate(-0.3125rem, -0.3125rem)');

cssContent = cssContent.replace(/translate\(-10px, 10px\)/g, 'translate(-0.625rem, 0.625rem)');
cssContent = cssContent.replace(/translate\(10px, -10px\)/g, 'translate(0.625rem, -0.625rem)');
cssContent = cssContent.replace(/translate\(-15px, -5px\)/g, 'translate(-0.9375rem, -0.3125rem)');
cssContent = cssContent.replace(/translate\(15px, 5px\)/g, 'translate(0.9375rem, 0.3125rem)');
cssContent = cssContent.replace(/translate\(-10px, 15px\)/g, 'translate(-0.625rem, 0.9375rem)');
cssContent = cssContent.replace(/translate\(10px, -15px\)/g, 'translate(0.625rem, -0.9375rem)');
cssContent = cssContent.replace(/translate\(-5px, -10px\)/g, 'translate(-0.3125rem, -0.625rem)');
cssContent = cssContent.replace(/translate\(5px, 10px\)/g, 'translate(0.3125rem, 0.625rem)');
cssContent = cssContent.replace(/translate\(-10px, 5px\)/g, 'translate(-0.625rem, 0.3125rem)');

cssContent = cssContent.replace(/translateX\(-15px\)/g, 'translateX(-0.9375rem)');
cssContent = cssContent.replace(/translateX\(15px\)/g, 'translateX(0.9375rem)');

fs.writeFileSync('js/features/fusion/fusion.css', cssContent);

let jsContent = fs.readFileSync('js/features/fusion/FusionAnimation.js', 'utf8');

jsContent = jsContent.replace(/particle.style.setProperty\("--tx", \`\$\{tx\}px\`\);/g, 'particle.style.setProperty("--tx", `${tx/16}rem`);');
jsContent = jsContent.replace(/particle.style.setProperty\("--ty", \`\$\{ty\}px\`\);/g, 'particle.style.setProperty("--ty", `${ty/16}rem`);');

fs.writeFileSync('js/features/fusion/FusionAnimation.js', jsContent);
