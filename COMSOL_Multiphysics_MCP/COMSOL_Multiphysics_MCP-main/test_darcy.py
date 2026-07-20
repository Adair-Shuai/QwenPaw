import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

"""
达西流多孔介质渗流模型测试
模拟一个矩形多孔介质区域，左侧定压进水，右侧定压出水
"""

import mph
import numpy as np
import time

# 1. 启动 COMSOL 客户端
print("[1/9] 启动 COMSOL 客户端...")
start = time.time()
client = mph.Client(version='6.1')
print(f"      已连接: v{client.version}, {client.cores}核, 耗时{time.time()-start:.1f}s")

# 2. 创建新模型
print("[2/9] 创建新模型...")
model = client.create('darcy_flow_test')

# 3. 创建 2D 组件
print("[3/9] 创建 2D 组件...")
jm = model.java
comp = jm.component().create('comp1', True, 2)

# 4. 建立几何 - 10m x 5m 矩形
print("[4/9] 创建几何 (10m x 5m 矩形)...")
geom = comp.geom().create('geom1', 2)
rect = geom.feature().create('r1', 'Rectangle')
rect.set('pos', ['0', '0'])
rect.set('size', ['10', '5'])
geom.run()
print("      几何构建完成")

# 5. 添加达西流物理场
print("[5/9] 添加达西流物理场 (Darcy's Law)...")
physics = comp.physics().create('dl', 'Darcy')

# 6. 设置边界条件
print("[6/9] 设置边界条件...")
# 左侧边界 (边界4) - 高压进水口 1e5 Pa
inlet = physics.create('inlet1', 'Pressure')
inlet.selection().set([3])
inlet.set('p0', '1e5[Pa]')

# 右侧边界 (边界2) - 低压出水口 0 Pa  
outlet = physics.create('outlet1', 'Pressure')
outlet.selection().set([4])
outlet.set('p0', '0[Pa]')
print("      边界条件: 左=>1e5 Pa, 右=>0 Pa")

# 7. 创建稳态研究
print("[7/9] 创建稳态研究...")
study = jm.study().create('std1')
study.create('step1', 'stat')

# 8. 求解
print("[8/9] 求解中 (请稍候)...")
solve_start = time.time()
model.solve('std1')
solve_time = time.time() - solve_start
print(f"      求解完成! 耗时 {solve_time:.1f}s")

# 9. 后处理
print("[9/9] 后处理...")

# 压力场
p = model.evaluate('p')
print(f"\n=== 结果 ===")
print(f"  压力范围: {np.min(p):.2f} ~ {np.max(p):.2f} Pa")

# 达西速度
v_mag = model.evaluate('dl.normV')
print(f"  达西速度模: 平均={np.mean(v_mag):.6e} m/s, 最大={np.max(v_mag):.6e} m/s")

# 保存
model.save('darcy_flow_result.mph')
print(f"\n模型已保存: darcy_flow_result.mph")
print("测试完成!")
