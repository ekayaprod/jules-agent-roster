with open("js/UI/JulesTerminal/JulesTerminal.test.js", "r") as f:
    content = f.read()

# We need to make sure we didn't inject global.AgentUtils that pollutes other tests,
# but it's fine since we run in isolated environments or we can just mock it properly.
# Let's clean up AgentUtils mock.
content = content.replace("global.AgentUtils = { getPromptUrl: () => 'some/url' };", "")
content = content.replace("expect(mockApp.agentRepo.fetchPrompt).toHaveBeenCalled();", "expect(global.AgentUtils.getPromptUrl).toHaveBeenCalled();\n            expect(mockApp.agentRepo.fetchPrompt).toHaveBeenCalled();")

old_setup = """        mockApp = {
            toast: mockToast,
            agents: [{ name: 'TestAgent', emoji: '🤖' }],
            customAgents: { 'custom': { name: 'CustomAgent', emoji: '🔥' } },
            agentRepo: {
                fetchPrompt: jest.fn().mockResolvedValue("Fetched Prompt")
            }
        };"""

new_setup = """        mockApp = {
            toast: mockToast,
            agents: [{ name: 'TestAgent', emoji: '🤖' }],
            customAgents: { 'custom': { name: 'CustomAgent', emoji: '🔥' } },
            agentRepo: {
                fetchPrompt: jest.fn().mockResolvedValue("Fetched Prompt")
            }
        };
        global.AgentUtils = {
            getPromptUrl: jest.fn().mockReturnValue('some/url')
        };"""

content = content.replace(old_setup, new_setup)

with open("js/UI/JulesTerminal/JulesTerminal.test.js", "w") as f:
    f.write(content)
