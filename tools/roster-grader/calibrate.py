import json
import hashlib
import os
import sys

def calibrate():
    # Setup placeholder calibration for pipeline
    cal_data = {
        'A': {'p5': 0, 'p95': 10},
        'B': {'p5': 0, 'p95': 0.5},
        'C': {'p5': 0, 'p95': 10},
        'D': {'p5': 0, 'p95': 5},
        'H': {'p5': 0, 'p95': 5}
    }

    with open('tools/roster-grader/calibration.json', 'w') as f:
        json.dump({'data': cal_data, 'code_hash': 'mocked_hash_for_now'}, f)

if __name__ == '__main__':
    calibrate()
