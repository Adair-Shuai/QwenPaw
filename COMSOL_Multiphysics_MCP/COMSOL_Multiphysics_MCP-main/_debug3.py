import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
client = mph.Client(version='6.1')
model = client.create('darcy_test')
jm = model.java
print(f"jm type: {type(jm)}")
print(f"jm dir: {[x for x in dir(jm) if not x.startswith('_')]}")
