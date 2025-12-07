Import("env")
import os

def stringify(s):
    return f'\\"{s}\\"'

try:
    with open(".env", "r") as f:
        lines = f.readlines()
    
    envs = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"): continue
        if "=" in line:
            key, value = line.split("=", 1)
            env.Append(CPPDEFINES=[(key, stringify(value))])
            envs.append(key)
    print(f"\n--- Environmental variables loaded: {', '.join(envs)} ---\n")
except IOError:
    print("\n--- ERROR: .env FILE NOT FOUND ---\n")