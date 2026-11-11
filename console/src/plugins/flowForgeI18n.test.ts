import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import {
  translateWorkflow,
  workflowEnglish,
  workflowLocale,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/i18n";
import {
  connectionIssue,
  configurationDiagnostics,
  validationDiagnostics,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/graphContracts";
import {
  localizedSpec,
  type FlowDocument,
  type NodeTypeSpec,
} from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/model";
import { fieldLabel } from "../../../src/qwenpaw/plugins_bundle/flowforge/ui/src/fieldPresentation";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");
const savedLanguage = localStorage.getItem("language");

afterEach(() => {
  if (savedLanguage === null) localStorage.removeItem("language");
  else localStorage.setItem("language", savedLanguage);
});

describe("FlowForge interface language resources", () => {
  it("declares the parser required by its source translation checks", () => {
    const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
    const declaration = manifest.devDependencies["@babel/parser"];
    expect(typeof declaration).toBe("string");
    expect(declaration).toBeTruthy();
    expect(lock.packages[""].devDependencies["@babel/parser"]).toBe(
      declaration,
    );
  });

  it("localizes unavailable structured output diagnostics while retaining field and edge locations", () => {
    const diagnostic = {
      code: "OUTPUT_SLOT_UNAVAILABLE",
      severity: "error" as const,
      message: "parsed 输出仅在来源节点启用 json_schema 模式时可用。",
      node_id: "目标 English",
      field: "inputs.value",
      edge_id: "连接-id",
    };
    const validation = { ok: false, errors: [], diagnostics: [diagnostic] };
    expect(validationDiagnostics(validation, "en")).toEqual([
      {
        ...diagnostic,
        message:
          "The structured result is available only when the source node uses JSON Schema mode.",
      },
    ]);
    expect(validationDiagnostics(validation, "zh")[0].message).toBe(
      "结构化结果仅在来源节点启用 JSON Schema 模式时可用。",
    );
    expect(diagnostic.message).toContain("parsed");
    const invalidReference = {
      ...diagnostic,
      code: "TEMPLATE_REFERENCE_INVALID",
      message: "变量引用无效：Unknown template output '中文.source'",
    };
    expect(
      validationDiagnostics(
        { ...validation, diagnostics: [invalidReference] },
        "en",
      )[0],
    ).toEqual({
      ...invalidReference,
      message:
        "Invalid variable reference Unknown template output '中文.source'",
    });
  });

  it("localizes actual builtin class ids and distinguishes validated JSON calls without rewriting business values", () => {
    const builtinIds = [
      "Art.Preview",
      "Agent.control_agent",
      "LoadImage",
      "LoadMesh3D",
      "LLMCallNode",
    ];
    const specs = builtinIds.map((class_type) => ({
      class_type,
      display_name: class_type,
      description: "Backend description",
      category: "workflow/ai",
      inputs_schema: [{ name: "中文 business", default: "原始 English 数据" }],
      outputs_schema: [],
      control_schema: [],
      icon: "",
    }));
    const chinese = specs.map((spec) => localizedSpec(spec, "zh"));
    const english = specs.map((spec) => localizedSpec(spec, "en"));
    expect(chinese.map((spec) => spec.display_name)).toEqual([
      "产物预览",
      "调度智能体",
      "加载图片",
      "加载三维模型",
      "模型调用 / JSON",
    ]);
    expect(english.map((spec) => spec.display_name)).toEqual([
      "Artifact preview",
      "Control agent",
      "Load image",
      "Load 3D model",
      "Model call / JSON",
    ]);
    expect(english[4].description).toContain("JSON Schema");
    expect(fieldLabel({ name: "transform" }, "zh")).toBe("转换表达式");
    expect(fieldLabel({ name: "transform" }, "en")).toBe(
      "Transform expression",
    );
    for (const [index, spec] of english.entries()) {
      expect(spec.inputs_schema).toEqual(specs[index].inputs_schema);
      expect(spec.class_type).toBe(builtinIds[index]);
    }
  });

  it("localizes connection and required-input diagnostics while retaining node and field identities", () => {
    const nodes = [
      {
        id: "source_中文",
        data: { outputs_schema: [{ name: "value", type: "string" }] },
      },
      {
        id: "target_English",
        data: { inputs_schema: [{ name: "threshold", type: "number" }] },
      },
    ];
    expect(
      connectionIssue(
        {
          source: "source_中文",
          target: "target_English",
          sourceHandle: "value",
          targetHandle: "threshold",
        },
        nodes,
        [],
        "en",
      ),
    ).toBe("Incompatible types string → number");
    const flow = {
      nodes: {
        target_English: {
          class_type: "LLMCallNode",
          inputs: { temperature: 0 },
        },
      },
    } as unknown as FlowDocument;
    const specs = [
      {
        class_type: "LLMCallNode",
        inputs_schema: [
          { name: "prompt", required: true },
          { name: "temperature", required: true },
        ],
      },
    ] as NodeTypeSpec[];
    expect(configurationDiagnostics(flow, specs, "en")).toEqual([
      {
        code: "required_input",
        severity: "error",
        node_id: "target_English",
        field: "inputs.prompt",
        message: "Enter Prompt",
      },
    ]);
    expect(
      validationDiagnostics(
        {
          ok: false,
          errors: ["node 'target_English' required input 'prompt' is missing"],
        },
        "en",
      )[0],
    ).toMatchObject({
      node_id: "target_English",
      field: "inputs.prompt",
      message: "Enter Prompt",
    });
    expect(flow.nodes.target_English.inputs.temperature).toBe(0);
  });

  it("covers every static workflow interface translation with an English resource", () => {
    const directory = path.resolve(
      process.cwd(),
      "../src/qwenpaw/plugins_bundle/flowforge/ui/src",
    );
    const missing: string[] = [];
    const inspect = (value: unknown, file: string) => {
      if (!value || typeof value !== "object") return;
      const node = value as Record<string, any>;
      if (
        node.type === "CallExpression" &&
        node.callee?.name === "t" &&
        node.arguments?.[0]?.type === "StringLiteral" &&
        /[\u3400-\u9fff]/.test(node.arguments[0].value) &&
        node.arguments?.[1]?.type !== "StringLiteral" &&
        !workflowEnglish[node.arguments[0].value]
      )
        missing.push(`${file} ${node.arguments[0].value}`);
      for (const child of Object.values(node)) {
        if (Array.isArray(child))
          child.forEach((entry) => inspect(entry, file));
        else if (child && typeof child === "object") inspect(child, file);
      }
    };
    for (const file of fs
      .readdirSync(directory)
      .filter((name) => /\.tsx?$/.test(name))) {
      if (["english.ts", "i18n.ts"].includes(file)) continue;
      inspect(
        parse(fs.readFileSync(path.join(directory, file), "utf8"), {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        }),
        file,
      );
    }
    expect(missing).toEqual([]);
    expect(Object.keys(workflowEnglish).length).toBeGreaterThan(100);
    for (const english of Object.values(workflowEnglish))
      expect(english).not.toMatch(/[\u3400-\u9fff]/);
  });

  it("interpolates bilingual business values while keeping stored identifiers intact", () => {
    const values = { name: "中文_report.source" };
    expect(
      translateWorkflow("参数 {name}", "en", "Parameter {name}", values),
    ).toBe("Parameter 中文_report.source");
    expect(
      translateWorkflow("参数 {name}", "zh", "Parameter {name}", values),
    ).toBe("参数 中文_report.source");
    expect(translateWorkflow("custom_business_identifier", "en")).toBe(
      "custom_business_identifier",
    );
    expect(translateWorkflow("待执行", "en")).toBe("Pending");
    expect(translateWorkflow("生成温度", "en")).toBe("Temperature");
  });

  it("uses the host language with regional codes and retains the legacy Chinese fallback", () => {
    localStorage.removeItem("language");
    expect(workflowLocale()).toBe("zh");
    expect(workflowLocale("en-US")).toBe("en");
    expect(workflowLocale("zh-CN")).toBe("zh");
    localStorage.setItem("language", "en");
    expect(workflowLocale()).toBe("en");
    expect(workflowLocale("zh-Hans")).toBe("zh");
  });
});
