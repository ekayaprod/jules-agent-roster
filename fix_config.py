import json

with open("tools/roster-grader/config.json", "r") as f:
    cfg = json.load(f)

cfg["tool_whitelist"] = ["git", "npm", "npx", "apt", "apt-get", "docker", "docker-compose", "grep", "tsc", "jest", "playwright"]

with open("tools/roster-grader/config.json", "w") as f:
    json.dump(cfg, f, indent=2)
