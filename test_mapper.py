import re

text = "MAPPER AVOIDS (not worth the complexity):\n❌ Writing unit tests.\n❌ Changing core code logic."

agent_name = "script supervisor"
if agent_name.split(' ')[0].lower() in text.lower():
    print("Found script")
else:
    print("Not found script")
