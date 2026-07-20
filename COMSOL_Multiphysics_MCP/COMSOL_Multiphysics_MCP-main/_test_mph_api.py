import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
import numpy as np

print("启动 COMSOL...")
client = mph.Client(version='6.1')
model = client.create('darcy_test')
jm = model.java

print(f"已加载模块: {model.modules()}")

# 正确创建组件 - 使用 Java API
print("\n创建组件...")
# 需要先有 model node
model_node = jm.model()
comp = model_node.component().create('comp1')
print(f"组件 '{comp.tag()}' 已创建")

# 创建几何
geom = comp.geom().create('geom1', 2)
rect = geom.feature().create('r1', 'Rectangle')
rect.set('pos', ['0', '0'])
rect.set('size', ['10', '5'])
geom.run()
print("几何构建完成")

# 现在再试创建物理场
print("\n测试物理场...")
for ptype in ['Electrostatics', 'HeatTransfer', 'SolidMechanics', 'LaminarFlow', 'Darcy']:
    try:
        p = comp.physics().create(f't_{ptype}', ptype)
        print(f"  {ptype}: OK!")
    except Exception as e:
        err = str(e)
        if 'Unknown' in err:
            print(f"  {ptype}: 不可用(模块未加载)")
        elif 'NullPointer' in err:
            print(f"  {ptype}: NullPointer-可能组件创建方式有问题")
        else:
            print(f"  {ptype}: {err[:80]}")

# 查看物理场列表
try:
    print(f"\n物理场列表: {model.physics()}")
except:
    pass
