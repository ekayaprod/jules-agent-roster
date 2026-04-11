## Cortex — NetworkUtils Payload Fortification
**Learning:** Parsing network responses or interacting with errors requires checking that string payloads explicitly exist as strings, else unhandled exceptions like `.startsWith` mask true failures.
**Action:** Enforce `typeof === 'string'` checking prior to `.startsWith` validations and `JSON.parse` executions for safety. Invoked Declarative Compliance Fallback as no other safe targets were found without violating Test Immunity.

## Cortex — Jules API Standard Parameter Compliance
**Learning:** The Jules API alpha endpoint does not support `response_format` when creating sessions. Including an unsupported parameter in the creation body causes a fatal 400 error (`Cannot find field`), preventing successful session launch.
**Action:** Removed the `response_format` JSON schema definition block from the POST body payload in `JulesService.js` to restore payload compatibility with the API's standard standard parameters constraint.
