const fs = require('fs');
const files = [
    'Pacemaker.md', 'Pacesetter.md', 'PathCentralizer.md', 'Pathfinder.md', 'Payload.md',
    'Placebo.md', 'Policy Maker.md', 'Polyglot.md', 'Polygraph.md', 'Prefect.md'
];
for (const f of files) {
    const p = 'prompts/fusions/' + f;
    if (!fs.existsSync(p)) {
        console.log(`Missing: ${f}`);
        continue;
    }
    const txt = fs.readFileSync(p, 'utf8');
    const roleMatch = txt.match(/You are "(.*?)" (.*?) - (.*?)\./);
    const objMatch = txt.match(/The Objective: (.*)/);
    const enemyMatch = txt.match(/The Enemy: (.*)/);
    const favsMatch = txt.indexOf('FAVORITE OPTIMIZATIONS:');
    const avoidsMatch = txt.indexOf('AVOIDS');

    let favs = "";
    let avoids = "";
    if (favsMatch !== -1 && avoidsMatch !== -1) {
        favs = txt.substring(favsMatch, avoidsMatch).trim();
        avoids = txt.substring(avoidsMatch).trim();
    } else {
        favs = "N/A"; avoids = "N/A";
    }
    console.log(`\n================ ${f} ================`);
    if(roleMatch) console.log(`ROLE: ${roleMatch[1]} ${roleMatch[2]} - ${roleMatch[3]}`);
    if(objMatch) console.log(`OBJ: ${objMatch[1]}`);
    if(enemyMatch) console.log(`ENEMY: ${enemyMatch[1]}`);
    console.log(favs);
    console.log(avoids);
}
