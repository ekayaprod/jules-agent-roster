#!/bin/bash

# Update Master-Forge.md dynamically
sed -i '/CRITICAL COMPILER DIRECTIVES FOR JSON INTEGRITY/a \* **DYNAMIC LABEL PRESERVATION:** You MUST explicitly include the bolded markdown labels inside your JSON strings for all Operational Mandates. Do not output raw text. You must output "* **The Blast Radius:** [text]" or "* **The Fortification Scope:** [text]".' prompts/system/Master-Forge.md

cat << 'JSON_SCHEMA_UPDATE' > replace_schema.txt
<<<<<<< SEARCH
  "strict_operational_mandates": {
    "domain_anchor": "[Exact text from Module 5 Slot 1]",
    "mutation_scope": "[Exact text from Module 5 Slot 2]",
    "execution_mandate": "[Exact text from Module 4 Velocity Mandate]",
    "operational_boundaries": "[Exact text from Module 5 Slot 3]",
    "decisiveness_rule": "[Exact text from Module 5 Slot 5]",
    "workflow_execution": "[Exact text from Module 5 Slot 6]",
    "testing_doctrine": "[Evaluated Testing Doctrine]",
    "salvaged_mandates": [
      "[Rule 1]"
    ]
  },
=======
  "strict_operational_mandates": {
    "domain_anchor": "[* **The Domain Anchor:** Exact text from Module 5 Slot 1]",
    "mutation_scope": "[* **The [Archetype specific Scope Label]:** Exact text from Module 5 Slot 2]",
    "execution_mandate": "[Exact text from Module 4 Velocity Mandate]",
    "operational_boundaries": "[* **The Validation Resilience Protocol:** Exact text from Module 5 Slot 3]",
    "decisiveness_rule": "[* **The [Archetype specific Decisiveness Label]:** Exact text from Module 5 Slot 5]",
    "workflow_execution": "[* **The [Archetype specific Execution Label]:** Exact text from Module 5 Slot 6]",
    "testing_doctrine": "[Evaluated Testing Doctrine]",
    "salvaged_mandates": [
      "[* **The Name:** Rule 1]"
    ]
  },
>>>>>>> REPLACE
JSON_SCHEMA_UPDATE
