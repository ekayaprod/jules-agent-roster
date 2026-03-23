with open('prompts/fusions/Prompt Engineer.md', 'r') as f:
    text = f.read()
    if 'Operate fully autonomously with binary decisions (`[Evolve]` vs `[Skip]`).' not in text:
        print('Error: Boundary not replaced correctly.')
    if 'Execute with a tight blast radius: target exactly one prompt template, `.md` persona file, or inline string per execution to ensure downstream LLM behavior can be safely validated.' not in text:
        print('Error: Blast radius not replaced correctly.')
