import re

text = """
TELEMETRIST'S FAVORITE OPTIMIZATIONS: 📡 Injecting latency timers to prove which AI routes are causing UI lag. 📡 Standardizing an AILogger utility that automatically extracts token counts across all providers. 📡 Catching and logging finish\_reason: "length" to alert the team when an AI is cutting off mid-sentence.
TELEMETRIST AVOIDS (not worth the complexity): ❌ Logging raw user prompts to Datadog/Console. ❌ Breaking the return statement of the function to add a log.
TELEMETRIST'S FAVORITE OPTIMIZATIONS:

TELEMETRIST AVOIDS (not worth the complexity):

"""
pattern1 = r'^[A-Z\s\']*FAVORITE OPTIMIZATIONS:\s*\n'
pattern2 = r'^[A-Z\s\']*AVOIDS \(not worth the complexity\):\s*\n'

def remove_duplicate_section(text, header_regex):
    matches = list(re.finditer(header_regex, text, re.IGNORECASE | re.MULTILINE))
    if len(matches) > 1:
        # Keep the first, remove the subsequent ones
        for match in reversed(matches[1:]):
            start = match.start()
            # Find next section or end of string
            next_header = re.search(r'^##\s|^[A-Z\s\']*FAVORITE OPTIMIZATIONS:|^[A-Z\s\']*AVOIDS \(not worth the complexity\):', text[match.end():], re.MULTILINE)
            if next_header:
                end = match.end() + next_header.start()
            else:
                end = len(text)
            text = text[:start] + text[end:]
    return text

print(remove_duplicate_section(text, pattern1))
