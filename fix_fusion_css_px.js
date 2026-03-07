const fs = require('fs');
let css = fs.readFileSync('js/features/fusion/fusion.css', 'utf8');

css = css.replace(/width: 1px;/g, 'width: 0.0625rem;');
css = css.replace(/height: 1px;/g, 'height: 0.0625rem;');
css = css.replace(/width: 6px;/g, 'width: 0.375rem;');
css = css.replace(/height: 6px;/g, 'height: 0.375rem;');
css = css.replace(/border-width: 4px;/g, 'border-width: 0.25rem;');
css = css.replace(/border: 4px/g, 'border: 0.25rem');
css = css.replace(/0px/g, '0');

fs.writeFileSync('js/features/fusion/fusion.css', css);
