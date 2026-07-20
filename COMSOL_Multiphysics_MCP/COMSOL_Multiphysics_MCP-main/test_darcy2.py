import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
client = mph.Client(version='6.1')
model = client.create('test')
jm = model.java
# Check create signature
import inspect
try:
    sig = inspect.signature(jm.component().create)
    print("create sig:", sig)
except:
    pass

# Try: create with tag only
comp = jm.component().create('comp1')
print("comp created:", comp)
print("comp tag:", comp.tag())

geom = comp.geom().create('geom1', 2)
print("geom created:", geom.tag())

rect = geom.feature().create('r1', 'Rectangle')
rect.set('pos', ['0', '0'])
rect.set('size', ['10', '5'])
geom.run()
print("Rectangle created")

# Darcy physics
physics = comp.physics().create('dl', 'Darcy')
print("Physics created:", physics.tag())

# Boundaries
n_b = geom.getNboundary()
print(f"Number of boundaries: {n_b}")

# Pressure inlet on left (b3)
inlet = physics.create('inlet1', 'Pressure')
inlet.selection().set([3])
inlet.set('p0', '1e5[Pa]')
print("Inlet set")

# Pressure outlet on right (b4)
outlet = physics.create('outlet1', 'Pressure')
outlet.selection().set([4])
outlet.set('p0', '0[Pa]')
print("Outlet set")

# Study
study = jm.study().create('std1')
study.create('step1', 'stat')
print("Study created")

# Solve
print("Solving...")
model.solve('std1')
print("Done!")

# Evaluate
import numpy as np
p = model.evaluate('p')
print(f"Pressure: {np.min(p):.2f} ~ {np.max(p):.2f} Pa")
v = model.evaluate('dl.normV')
print(f"Velocity: mean={np.mean(v):.6e} max={np.max(v):.6e} m/s")

model.save('darcy_result.mph')
print("Saved!")
