import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph

# mph 连上后，它的 Java 后端是已经启动了的
# 物理场不可用很可能是因为默认只启动了核心，没有加载模块
# 解决方式是通过 COMSOL 的 Java API 手动 load 产品模块

client = mph.Client(version='6.1')
print(f"已连接: v{client.version}")

# 获取 Java 后端
# mph.Client 内部有个 _server 可以拿到 com.comsol…
# 但实际用的更多的办法是通过 model 的 Java API

model = client.create('test')
jm = model.java
comp = jm.component().create('comp1')

# 试 COMSOL 实际物理接口名（在 COMSOL 6.1 中达西流是 PorousMediaFlow 而非单独的）  
# 先检查 model 有哪些 modules
try:
    mods = jm.model().modules()
    print(f"已加载模块: {mods}")
except:
    print("无法获取模块列表")

# 尝试用完整特性名创建
# 在 COMSOL Java API 中，物理场特性名通常如 "Electrostatics" 而非 "es"
for name in ['Electrostatics', 'SolidMechanics', 'HeatTransfer', 'LaminarFlow',
             'DarcyLaw', 'PorousMediaFlow']:
    try:
        p = comp.physics().create(f't_{name}', name)
        print(f"  '{name}' --> OK")
    except Exception as e:
        print(f"  '{name}' --> {str(e)[:60]}")

# 尝试用 mph 的高阶 API
try:
    model.physics('es')
    print("  mph physics('es') --> OK")
except:
    print("  mph physics('es') --> Fail")
