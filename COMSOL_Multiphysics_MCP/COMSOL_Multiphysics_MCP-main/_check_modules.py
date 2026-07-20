import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
client = mph.Client(version='6.1')
print(f"已连接: v{client.version}, {client.cores}核")

model = client.create('test')
jm = model.java
comp = jm.component().create('comp1')

# Test all known physics interface names
candidates = [
    'DarcyLaw', 'Darcy', 'dl',
    'PorousMediaFlow', 'PorousFlow', 
    'SubsurfaceFlow', 'ssf',
    'RichardsEquation', 're',
    'es', 'ec', 'solid', 'ht', 'spf',  # standard baselines
]
for name in candidates:
    try:
        p = comp.physics().create(f't_{name}', name)
        print(f"  '{name}' --> OK")
    except Exception as e:
        msg = str(e)
        if 'Unknown' in msg:
            print(f"  '{name}' --> Unavailable")
        else:
            print(f"  '{name}' --> {msg[:80]}")
