with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('        emojiKitchenPrefix: "https://emojik.vercel.app/s/",\n', '')

with open('index.html', 'w') as f:
    f.write(content)
