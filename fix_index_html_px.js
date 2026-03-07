const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace standard pixel values with rems
html = html.replace(/width: 1px;/g, 'width: 0.0625rem;');
html = html.replace(/height: 1px;/g, 'height: 0.0625rem;');
html = html.replace(/margin: -1px;/g, 'margin: -0.0625rem;');

fs.writeFileSync('index.html', html);
