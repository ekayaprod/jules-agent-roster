sed -i 's|js/UI/Singularity/SingularityBespokeBuilder.js|js/Features/Singularity/SingularityBespokeBuilder.js|g' index.html
sed -i 's|js/UI/Singularity/styles/SingularityBespokeBuilder.css|js/Features/Singularity/styles/SingularityBespokeBuilder.css|g' index.html
sed -i 's|js/UI/JulesTerminal/JulesModals.js|js/Features/JulesTerminal/JulesModals.js|g' index.html
sed -i 's|js/UI/JulesTerminal/TerminalPolling.js|js/Features/JulesTerminal/TerminalPolling.js|g' index.html
sed -i 's|js/UI/JulesTerminal/JulesTerminal.js|js/Features/JulesTerminal/JulesTerminal.js|g' index.html

sed -i 's|js/Utils/network-utils.js|js/Utils/network/network-utils.js|g' index.html
sed -i 's|js/Utils/storage-utils.js|js/Utils/storage/storage-utils.js|g' index.html
sed -i 's|js/Utils/prompt-parser.js|js/Utils/prompt/prompt-parser.js|g' index.html
sed -i 's|js/Utils/telemetry-utils.js|js/Utils/telemetry/telemetry-utils.js|g' index.html
sed -i 's|js/Utils/agent-utils.js|js/Utils/agent/agent-utils.js|g' index.html
sed -i 's|js/Utils/format-utils.js|js/Utils/format/format-utils.js|g' index.html
sed -i 's|js/Utils/performance-utils.js|js/Utils/performance/performance-utils.js|g' index.html
sed -i 's|js/Utils/download-utils.js|js/Utils/download/download-utils.js|g' index.html
sed -i 's|js/Utils/markdown-renderer.js|js/Utils/markdown/markdown-renderer.js|g' index.html
sed -i 's|js/Utils/dom-utils.js|js/Utils/dom/dom-utils.js|g' index.html
