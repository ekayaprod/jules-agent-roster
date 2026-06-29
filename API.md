# 📡 Jules API Macroscopic Endpoints

Welcome to the matrix of undocumented endpoints for the `JulesAPI` service! This documentation maps out the exact backend endpoints, HTTP methods, and internal class methods discovered directly from the `JulesAPI.js` ground truth. ⚡

## 🚀 The Protocol Matrix

Here is the exact layout of the network operations used to orchestrate Jules Agent sessions:

| Internal Class Method | Endpoint | HTTP Method | Payload / Description |
| :--- | :--- | :--- | :--- |
| `getSources()` | `/sources` | `GET` | Fetches the available sources (repositories). |
| `getSessions()` | `/sessions` | `GET` | Fetches all active sessions across all repositories. |
| `getSessionsByRepo(repo)` | `/sessions?repo={repo}` | `GET` | Fetches sessions filtered for a specific target repository. |
| `getSession(sessionId)` | `/sessions/{sessionId}` | `GET` | Fetches the precise details of a specific session payload. |
| `createSession(prompt, userTask, source, title)` | `/sessions` | `POST` | Launches a new agent session. Requires `prompt`, `sourceContext`, and `automationMode`. |
| `getActivities(sessionId)` | `/sessions/{sessionId}/activities` | `GET` | Polls the activities payload (chat logs, outputs) for a given session. |
| `provideInput(sessionId, text)` | `/sessions/{sessionId}/activities` | `POST` | Dispatches user input back to a blocked session requiring intervention. |

*Note: All endpoints are strictly prefixed with the base URL `https://jules.googleapis.com/v1alpha` and require the Google API `key` search parameter to be appended for authorization.* 🔐
