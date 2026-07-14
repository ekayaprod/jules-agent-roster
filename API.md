# 📡 Jules API Macroscopic Endpoints

Welcome to the matrix of undocumented endpoints! This documentation maps out the exact backend endpoints, HTTP methods, and internal class methods discovered directly from the ground truth of our core services (`JulesAPI.js`, `GithubAPI.js`, and `LLMRouter.js`). ⚡

## 🚀 The Protocol Matrix

Here is the exact layout of the network operations used to orchestrate Jules Agent sessions and external handshakes:

| Internal Class Method | Endpoint | HTTP Method | Payload / Description |
| :--- | :--- | :--- | :--- |
| `getSources()` | `/sources` | `GET` | Fetches the available sources (repositories). |
| `getSessions()` | `/sessions` | `GET` | Fetches all active sessions across all repositories. |
| `getSessionsByRepo(repo)` | `/sessions?repo={repo}` | `GET` | Fetches sessions filtered for a specific target repository. |
| `getSession(sessionId)` | `/sessions/{sessionId}` | `GET` | Fetches the precise details of a specific session payload. |
| `createSession(prompt, userTask, source, title)` | `/sessions` | `POST` | Launches a new agent session. Requires `prompt`, `sourceContext`, and `automationMode`. |
| `approvePlan(sessionId)` | `/sessions/{sessionId}:approvePlan` | `POST` | Approves a plan in a session. |
| `getActivities(sessionId)` | `/sessions/{sessionId}/activities` | `GET` | Polls the activities payload (chat logs, outputs) for a given session. |
| `provideInput(sessionId, text)` | `/sessions/{sessionId}/activities` | `POST` | Dispatches user input back to a blocked session requiring intervention. |
| `getPullRequests(repo)` | `/repos/{repo}/pulls?state=open` | `GET` | Fetches a list of open pull requests for the specified GitHub repository. |
| `getPullRequest(repo, pullNumber)` | `/repos/{repo}/pulls/{pullNumber}` | `GET` | Fetches the specific data for a given pull request. |
| `chatOpenAI(messages, model, temperature)` | `https://api.openai.com/v1/chat/completions` | `POST` | Routes a chat completion request to OpenAI models. |
| `chatAnthropic(messages, model, temperature, maxTokens)` | `https://api.anthropic.com/v1/messages` | `POST` | Routes a message request to Anthropic's Claude models. |

*Note: JulesAPI endpoints are strictly prefixed with `https://jules.googleapis.com/v1alpha` (requiring a Google API `key`), GithubAPI endpoints are prefixed with `https://api.github.com` (requiring a Bearer token), and LLM routes use their respective provider base URLs.* 🔐
