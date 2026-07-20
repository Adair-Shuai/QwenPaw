import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import inspect, mph
sig = inspect.signature(mph.Client.__init__)
print('Client.__init__:', sig)
