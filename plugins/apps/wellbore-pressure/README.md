# 井筒压力计算 · UGSci 小应用

版本 1.0.0。入口：UGSci → 应用 → 井筒压力计算。

独立移植用户提供的 `代码(1).zip` 中井筒压力计算功能，使用 UGSci 宿主 React；无需额外安装科学计算依赖、TensorFlow 或外部服务；Python 入口仅负责向 UGSci 注册应用。

## 使用

1. 填写井口绝对压力、温度、沿井筒长度、内径、标况产气量、粗糙度、与水平面夹角及压缩因子。
2. 选择模型，点击“计算井筒压力”。打开时显示默认示例计算结果。
3. 查看井底流压、压差、重力与摩阻贡献；可对比两种模型及切换压力、温度、流速曲线。
4. Excel 导出包括说明与参数、100 m 采样、完整剖面和模型对比四个工作表。CSV 导出当前模型采样结果。方案保存/载入使用 JSON。

修改参数后原结果标为待更新，禁止导出，防止新参数与旧结果混淆。无效参数会明确报错。

## 计算范围

保留原程序单气相采气算法，未扩展为注气或多相流计算。名称沿用原代码，Orkiszewski 和 Beggs-Brill 均为简化实现；后者仅增加 `1+0.08 sin²θ` 摩阻修正。角度相对水平面，水平0°，垂直90°。压力为绝对压力。

重力+Darcy摩阻，显式逐段积分；固定摩尔质量0.018 kg/mol，固定地温梯度0.025 K/m（按沿井筒长度），常Z；标况101325 Pa、293.15 K。没有加速项、液相持液率和储层求解。极端高速工况需单独检验假设。

自动网格与原界面保持一致：`max(300, round(depth))`，round采用Python的半偶舍入。井底最后一点压降梯度沿用前一网格，保持与原代码一致。

## 构建与核验

在仓库根目录运行 `node plugins/apps/wellbore-pressure/build.mjs`（使用 console 已安装的 esbuild 与 JSZip）。
`node --test plugins/apps/wellbore-pressure/tests/model.test.mjs` 核对原 Python 算法参考输出、边界、守恒、采样及无效输入。

`ui/index.js` 是可直接安装的编译入口。通过仓库 `scripts/pack/generate_plugin_metadata.py --only wellbore-pressure` 打包。

## 第三方

Excel 文件使用 JSZip 3.10.1 生成，MIT 许可，Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso。许可证保存在 THIRD_PARTY_LICENSES.txt。
