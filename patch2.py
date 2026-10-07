import re

with open("tools/roster-grader/grader.py", "r") as f:
    code = f.read()

search1 = """def check_tool_availability(tools):
    missing = set()
    import shutil
    for tool in tools:
        if not shutil.which(tool):
            missing.add(tool)
    return missing"""

replace1 = """def check_tool_availability(tools, whitelist):
    missing = set()
    for tool in tools:
        if tool not in whitelist:
            missing.add(tool)
    return missing"""

code = code.replace(search1, replace1)

search2 = """    missing_tools = check_tool_availability(list(file_tools.keys()))"""
replace2 = """    whitelist = config.get('tool_whitelist', []) if config else []
    missing_tools = check_tool_availability(list(file_tools.keys()), whitelist)"""

code = code.replace(search2, replace2)

with open("tools/roster-grader/grader.py", "w") as f:
    f.write(code)
