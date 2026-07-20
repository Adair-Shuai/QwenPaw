import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
client = mph.Client(version='6.1')
model = client.create('test_physics')
jm = model.java
comp = jm.component().create('comp1')
geom = comp.geom().create('geom1', 2)
rect = geom.feature().create('r1', 'Rectangle')
rect.set('pos', ['0', '0'])
rect.set('size', ['1', '1'])
geom.run()

# Try to find Darcy's Law interface name
physics_names = [
    'DarcyLaw', 'Darcy', 'dl', 'DarcyLawInterface',
    'PorousMediaFlow', 'PorousFlow', 'DarcyLaw',
    'dlac', 'dll',  
    'SubsurfaceFlow', 'ssf',
    'RichardsEquation', 
]
for name in physics_names:
    try:
        p = comp.physics().create('test_' + name, name)
        print(f"SUCCESS: '{name}' works!")
        break
    except Exception as e:
        err = str(e)
        if 'Unknown' in err:
            print(f"  '{name}': Unknown physics")
        else:
            print(f"  '{name}': {err[:100]}")
