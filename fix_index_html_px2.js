const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Revert .sr-only and other 1px / 0px that are structural or accessibility clips
html = html.replace(/width: 0.0625rem;/g, 'width: 1px;');
html = html.replace(/height: 0.0625rem;/g, 'height: 1px;');
html = html.replace(/margin: -0.0625rem;/g, 'margin: -1px;');

fs.writeFileSync('index.html', html);
