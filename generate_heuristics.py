import os, glob

# Get the first 15 .md files alphabetically
directory = 'prompts/fusions/'
files = sorted(glob.glob(os.path.join(directory, '*.md')))[:15]

for f in files:
    print(os.path.basename(f))
