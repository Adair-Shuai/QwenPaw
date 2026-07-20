import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
client = mph.Client(version='6.1')
model = client.create('test')
jm = model.java
comp_list = jm.component()
print("create signatures:", dir(comp_list))
