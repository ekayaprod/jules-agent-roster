const fs = require('fs');
let css = fs.readFileSync('js/features/fusion/fusion.css', 'utf8');

// The earlier script erroneously changed box-shadow and text-shadow 20px to just 20 because of the 0px removal/replacement.
css = css.replace(/box-shadow: 0 0 20 #fff, inset 0 0 20 #fff;/g, 'box-shadow: 0 0 1.25rem #fff, inset 0 0 1.25rem #fff;');
css = css.replace(/box-shadow: 0 0 10 var/g, 'box-shadow: 0 0 0.625rem var');
css = css.replace(/text-shadow: 0 0 20 rgba/g, 'text-shadow: 0 0 1.25rem rgba');
css = css.replace(/text-shadow: 0 10 30 rgba/g, 'text-shadow: 0 0.625rem 1.875rem rgba');
css = css.replace(/@media \(min-width: 640\)/g, '@media (min-width: 640px)');

fs.writeFileSync('js/features/fusion/fusion.css', css);
