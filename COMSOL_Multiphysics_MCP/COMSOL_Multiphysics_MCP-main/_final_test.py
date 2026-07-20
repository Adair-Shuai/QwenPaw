import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph
import numpy as np

print("启动 COMSOL...")
client = mph.Client(version='6.1')
model = client.create('darcy_test')
jm = model.java

print(f"已加载模块: {model.modules()}")
print(f"已用产品: {jm.getUsedProducts()}")

# 组件已经自动创建了（mph 创建模型时）
print(f"\n组件: {model.components()}")

# 通过 mph Node API 创建几何 - 需要先检查 API
# mph 文档: model/'geometries'/'geom1'  
# 但之前说不能 create feature，可能因为默认创建了但节点类型不对
# 试试从 component 层面创建

print("\n尝试通过 mph API 创建...")
# 先获取已有几何
geoms = model.geometries()
print(f"已有几何: {geoms}")

if geoms:
    geom_name = geoms[0]
    geom_node = model/'geometries'/geom_name
    print(f"几何节点: {geom_node}")
    
    # 试创建 feature
    try:
        r1 = geom_node.create('Rectangle')
        r1.property('size', ['10[m]', '5[m]'])
        r1.property('pos', ['0', '0'])
        geom_node.run()
        print("矩形创建成功!")
    except Exception as e:
        print(f"mph创建失败: {e}")
        
        # 回退到 Java API
        print("\n回退到 Java API...")
        comp = jm.component().get(0)
        print(f"组件: {comp.tag()}")
        
        # 创建几何
        geom = comp.geom().create('geom1', 2)
        rect = geom.feature().create('r1', 'Rectangle')
        rect.set('pos', ['0', '0'])
        rect.set('size', ['10[m]', '5[m]'])
        geom.run()
        print("几何: OK")

        # 测试物理场
        print("\n测试物理场...")
        for ptype in ['es', 'ht', 'solid', 'spf']:
            try:
                p = comp.physics().create(ptype, ptype)
                print(f"  {ptype}: OK!")
            except Exception as e2:
                print(f"  {ptype}: {str(e2)[:60]}")
