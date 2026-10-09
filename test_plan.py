import yaml
def parse_frontmatter(content):
    frontmatter = {}
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            try:
                frontmatter = yaml.safe_load(fm_text) or {}
            except yaml.YAMLError:
                pass
            content = parts[2]
    return frontmatter, content
