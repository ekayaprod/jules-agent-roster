const fs = require('fs');
let css = fs.readFileSync('js/features/fusion/fusion.css', 'utf8');

css = css.replace(/width: 0.0625rem;/g, 'width: 1px;');
css = css.replace(/height: 0.0625rem;/g, 'height: 1px;');
css = css.replace(/margin: -0.0625rem;/g, 'margin: -1px;');

fs.writeFileSync('js/features/fusion/fusion.css', css);
