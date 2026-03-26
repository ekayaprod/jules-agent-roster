import subprocess
import os
import sys

worker_id = 4
total_workers = 5
batch_size = 10
state_file = f".forge_worker_{worker_id}_state"

try:
    result = subprocess.run(
        "git ls-files 'prompts/fusions/*.md' | sort",
        shell=True,
        check=True,
        stdout=subprocess.PIPE,
        text=True
    )
    all_files = [line.strip() for line in result.stdout.split('\n') if line.strip()]
except subprocess.CalledProcessError as e:
    print(f"Error: {e}")
    exit(1)

worker_files = []
for i, f in enumerate(all_files):
    if (i % total_workers) == (worker_id - 1):
        worker_files.append(f)

start_idx = 0
if os.path.exists(state_file):
    with open(state_file, 'r') as sf:
        try:
            start_idx = int(sf.read().strip())
        except ValueError:
            start_idx = 0

if sys.argv[-1] == "ALL":
    end_idx = len(worker_files)
else:
    end_idx = start_idx + batch_size
batch = worker_files[start_idx:end_idx]

for f in batch:
    print(f)
