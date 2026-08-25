class TerminalEvents {
    static bind(app) {
        if (app.elements.julesRepoPicker) {
            app.elements.julesRepoPicker.addEventListener('change', (e) => {
                if (app._cardHtmlCache) app._cardHtmlCache.clear();
                if (app._domNodeCache) app._domNodeCache.clear();
                app.renderAgents();

                const sourceName = e.target.value;
                if (sourceName) {
                    app.julesTerminal.loadActiveSessionsForRepo(sourceName).catch(err => {
                        const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
                        if (tu) tu.dispatchEvent("REPO_LOAD_ERROR", err);
                        else console.error(err);
                    });
                    app.julesTerminal.loadPullRequestsForRepo(sourceName).catch(err => {
                        const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
                        if (tu) tu.dispatchEvent("REPO_LOAD_ERROR", err);
                        else console.error(err);
                    });
                } else {
                    const terminal = app.elements.julesTerminal;
                    if (terminal) {
                        terminal.innerHTML = `<div class="terminal-line"><span class="terminal-time">[System]</span> Awaiting Agent launch command...</div>`;
                        terminal.classList.remove('active');
                    }
                    app.julesTerminal.cleanup();
                }
            });
        }

        const pullTab = document.getElementById("julesPullTab");
        const runnerPanel = document.getElementById("julesRunnerPanel");
        if (pullTab && runnerPanel) {
            pullTab.addEventListener("click", () => {
                runnerPanel.classList.toggle("open");
            });
        }

        const activateToggle = document.getElementById("julesActivateToggle");
        const runnerInputs = document.getElementById("runnerInputsContainer");
        const julesTerminal = document.getElementById("julesTerminal");

        if (activateToggle) {
            activateToggle.addEventListener("change", async (e) => {
                if (!e.target.checked) {
                    if (runnerInputs) runnerInputs.classList.remove("active");
                    if (julesTerminal) julesTerminal.classList.add("d-none");
                    return;
                }

                if (runnerInputs) runnerInputs.classList.add("active");
                if (julesTerminal) julesTerminal.classList.remove("d-none");
                // Load sources if not loaded already but initialized
                if (!app.julesTerminal || !app.julesTerminal.initialized) return;

                app.julesTerminal.loadSources().catch(err => {
                    const tu = typeof window !== 'undefined' ? window.TelemetryUtils : (typeof global !== 'undefined' ? global.TelemetryUtils : null);
                    if (tu) {
                        tu.dispatchEvent("TERMINAL_LOAD_ERROR", err);
                    } else {
                        console.error("JulesTerminal API failed to load sources after activation.", err);
                    }
                });
            });
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalEvents;
}
