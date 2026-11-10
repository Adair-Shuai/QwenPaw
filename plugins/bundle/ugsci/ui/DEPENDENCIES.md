# 可视化依赖约定

主程序与 UGSci UI 使用相同版本的 React 18.3.1、ReactDOM 18.3.1、Three.js 0.185.1、TypeScript 5.8.3、Vite 6.4.1，类型声明也保持一致。插件通过开发依赖锁定 React，并将宿主 peer 范围收紧到 `^18.3.1`，避免独立安装自动拉入 React 19。

井身组件采用 VidEx 3.4.3、Fiber 8.18.0、Drei 9.122.0、Comlink 4.4.2。Fiber 8 对应 React 18；升级 Fiber 9 或 Drei 10 必须与宿主 React 升级一起评估。管网试验中的 X6 不属于本插件依赖。

## 安装与构建

使用仓库 `.nvmrc` 指定的 Node 22.23.4。VidEx 要求 npm 12，本目录通过 `packageManager` 固定 npm 12.2.2；这个字段本身不会自动切换已安装的 npm。

从仓库安装 console 时，`console/scripts/prepare-ugsci-ui.mjs` 会使用锁定的 npm 安装器准备插件依赖，不修改全局 npm。独立安装本目录时执行：

```sh
npx --yes --package=npm@12.2.2 npm ci --engine-strict --no-audit --no-fund
npm run typecheck
npm run build
```

npm 12 支持 Node `^22.22.2 || ^24.15.0 || >=26`。例如 Node 24.13.1 不满足该安装器的声明；请使用仓库指定的 Node，而不是关闭引擎检查。npm 12 的安装脚本许可仅开放当前锁定的 `esbuild@0.25.12`。

`check:dependencies` 在构建、开发和类型检查入口运行，校验声明、lock、实际安装、宿主 lock，以及各组件解析到的 React/Three 实体路径。`test:compatibility` 在查看器构建前运行真实 VidEx 几何生成和 BVH 拾取／释放测试。

## 有意保留的定向覆盖

- Drei 9 的 `three-mesh-bvh` 固定为 0.8.3，替代上游已标记存在 Three 兼容问题的 0.7.8。测试覆盖套管几何、原生／加速拾取结果、GPU uniform 数据与释放。
- `stats-gl` 的 Three 和类型声明指向插件直接依赖，消除其声明带来的 Three 0.170 副本。该版本统计组件的 JavaScript 不导入 Three，只接收调用者的 renderer。
- Zustand 5 固定为宿主当前的 5.0.15；Fiber 和 tunnel-rat 内部使用的 Zustand 3、4 保留其上游兼容范围，不跨大版本覆盖。

## 运行边界

当前提交准备依赖并升级现有查看器；尚未将 VidEx 挂到正式井详情，也未扩展后端套管数据协议。井身组件在本地试验台验证，现有储层／井轨迹／管网仍使用原有页面逻辑。

Three.js 0.185 的 WebGLRenderer 需要 WebGL2。Fiber 8 创建 Three.Clock 时仍有弃用提示；当前版本中功能可用，未屏蔽该提示，也未修改第三方源码。

统一版本、依赖树去重与跨产物共享是不同层次：现有 viewer-runtime 是独立 IIFE，宿主其他页面的 Three 仍由宿主构建。以后将 VidEx 接入同一查看器构建时，继续使用公共 imports 和 Vite dedupe；不要另放一份包含 Three 的独立井身 IIFE。

修改后从仓库根目录同步 `python scripts/sync_ugsci_bundle.py --sync`。本地 `visualization/data` 数据保持不入发布包，测试夹具不依赖该目录。
