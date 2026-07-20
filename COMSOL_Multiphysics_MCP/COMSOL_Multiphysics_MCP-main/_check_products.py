import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import mph

# 关键: 指定产品模块加载
print("尝试加载 ACDC 模块启动...")
try:
    client = mph.Client(version='6.1', products=['ACDC'])
    print(f"成功! v{client.version}, {client.cores}核")
except Exception as e:
    print(f"ACDC 失败: {e}")
    print("\n尝试不带 products 启动...")
    client = mph.Client(version='6.1')
    
model = client.create('test')
jm = model.java
comp = jm.component().create('comp1')

# 测试基础物理场
for name in ['es', 'solid', 'ht', 'spf']:
    try:
        comp.physics().create(f't_{name}', name)
        print(f"  '{name}' --> OK")
    except:
        print(f"  '{name}' --> Unavailable")
