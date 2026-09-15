sed -i 's/this.app.toast.show(`Unable to connect to GitHub: ${error.message || "Unknown error"}`, true);/this.app.toast.show(`Unable to connect to GitHub: ${error.message || "Please check your credentials and try again."}`, true);/g' js/Features/JulesTerminal/JulesTerminal.js
sed -i 's/this.app.toast.show(`Could not launch the session: ${error.message || "Unknown error"}`/this.app.toast.show(`Could not launch the session: ${error.message || "Please check the terminal for details."}`/g' js/Features/JulesTerminal/JulesTerminal.js

sed -i 's/Unknown error/Please check your credentials and try again./g' js/Features/JulesTerminal/JulesTerminal.test.js
