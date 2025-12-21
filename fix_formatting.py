import re

def fix():
    with open('content/posts/the-thermodynamic-wall.md', 'r') as f:
        text = f.read()

    # Replace long underscores
    text = re.sub(r'_{5,}', '---', text)

    # Fix 2.2 Header
    # Current state: "2.2 "Time-to-Power" as the New Currency" (no hash)
    # Regex: Start of line, "2.2", space.
    text = re.sub(r'^2\.2 "', '### 2.2 "', text, flags=re.MULTILINE)

    with open('content/posts/the-thermodynamic-wall.md', 'w') as f:
        f.write(text)

if __name__ == '__main__':
    fix()
