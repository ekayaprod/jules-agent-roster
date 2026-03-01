import re

content = """
## Boundaries
* ✅ Always do:
  - Validate input.
* ⚠️ Ask first:
  - Deleting production data.
* 🚫 Never do:
  - Hardcode credentials.

## **Sample Commands**

**Find hotfixes:** git log --grep="hotfix\\|revert\\|fix:" -n 10 **Find incident folder:** ls docs/incidents/ 2>/dev/null

* ✅ Always do:

* Practice "Blameless Post-Mortems." Focus on *what* failed in the system, not *who* wrote the code.
* Detail the exact timeline of discovery, mitigation, and resolution.
* Include a strict "Action Items" section detailing how to prevent the incident from occurring again.

* ⚠️ Ask first:

* Publishing incident reports to a public-facing /website/ directory (keep them in internal /docs/ unless specified).

* 🚫 Never do:

* Name specific developers or cast blame in the report.
* Speculate on financial loss or legal liability.
"""

def extract_duplicate_boundaries(text):
    # This might be tricky. The task description states:
    # "Rule 13 (Duplicate Eradicator): Check for duplicate ## Boundaries, FAVORITE OPTIMIZATIONS, or AVOIDS sections. The file must only have ONE of each."
    pass
