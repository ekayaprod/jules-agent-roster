#!/bin/bash
# Check off the task in agent_tasks.md if it exists
if [ -f ".jules/agent_tasks.md" ]; then
    # We didn't actually claim a specific task from agent_tasks.md this time,
    # but we can look to see if there's one that matches our work.
    # Let's read the file first to see if there is a task to check off.
    grep "ExportController" .jules/agent_tasks.md
fi
