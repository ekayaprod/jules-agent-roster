with open("prompts/fusions/Mapper.md", "r") as f:
    text = f.read()

text = text.replace("Re-architecting dense Bash CI/CD scripts into modular, parallelized GitHub Action workflows", "Re-architecting dense Bash CI/CD automated configurations into modular, parallelized GitHub Action workflows")

with open("prompts/fusions/Mapper.md", "w") as f:
    f.write(text)
