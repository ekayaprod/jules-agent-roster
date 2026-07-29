/**
 * @jest-environment jsdom
 */

describe('JulesAPI window assignment', () => {
    it('assigns to window directly using raw code evaluation', () => {
         const fs = require('fs');
         const code = fs.readFileSync('js/Services/JulesAPI/JulesAPI.js', 'utf8');

         let windowMock = {};
         const scriptStr = `
             const module = undefined;
             ${code}
         `;

         const fn = new Function('window', scriptStr);
         fn(windowMock);

         expect(windowMock.JulesAPI).toBeDefined();
    });
});
