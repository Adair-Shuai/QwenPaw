/**
 * Tests for GenUiRegistry / GenUiTreeView component.
 *
 * Covers plan section 9.2:
 * - Unknown node kind renders safe fallback (no crash, no unescaped HTML)
 * - Known nodes render correctly (Stack, Text, etc.)
 * - Chart rendering (SVG-based)
 * - Empty/missing props handled gracefully
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { GenUiTreeView } from "@genui-src/components/GenUiRegistry";
import { GenUiInteractionProvider } from "@genui-src/components/GenUiInteraction";
import { resetActionBus } from "@genui-src/lib/genUiActionBus";
import type { GenUiNode } from "@genui-src/types/genUi";

// Set up window.QwenPaw.host with React and minimal antd stubs
beforeEach(() => {
  resetActionBus();
  (window as any).QwenPaw = {
    host: {
      React,
      antd: {
        Card: ({ children, title }: any) =>
          React.createElement("div", { className: "antd-card" }, title ? React.createElement("div", null, title) : null, children),
        Divider: ({ children }: any) => React.createElement("hr", null, children),
        Badge: ({ count }: any) => React.createElement("span", { className: "antd-badge" }, count),
        Tag: ({ children, color }: any) => React.createElement("span", { className: `antd-tag ${color}` }, children),
        Progress: ({ percent }: any) => React.createElement("div", { className: "antd-progress" }, `${percent}%`),
        Table: ({ dataSource, columns }: any) =>
          React.createElement("table", { className: "antd-table" },
            React.createElement("thead", null, React.createElement("tr", null, columns?.map((c: any) => React.createElement("th", { key: c.key }, c.title)))),
            React.createElement("tbody", null, dataSource?.map((row: any) => React.createElement("tr", { key: row.key }, columns?.map((c: any) => React.createElement("td", { key: c.key }, row[c.dataIndex]))))),
          ),
        List: ({ children }: any) => React.createElement("ul", { className: "antd-list" }, children),
        Typography: ({ children }: any) => React.createElement("div", { className: "antd-typography" }, children),
        Alert: ({ message, description }: any) => React.createElement("div", { className: "antd-alert" }, message, description),
        Button: ({ children, onClick }: any) => React.createElement("button", { onClick, className: "antd-button" }, children),
        Input: (props: any) => React.createElement("input", { ...props, className: "antd-input" }),
        Select: ({ children, onChange, value }: any) => React.createElement("select", { className: "antd-select", value, onChange: (event: any) => onChange?.(event.target.value) }, children),
      },
    },
  };
});

describe("GenUiTreeView — Interaction", () => {
  it("keeps a standalone input editable", () => {
    const node: GenUiNode = { nodeId: "name", kind: "Input", props: { label: "姓名", value: "" }, children: [] };
    const { getByLabelText } = render(React.createElement(GenUiTreeView, { node }));
    const input = getByLabelText("姓名") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "张三" } });
    expect(input.value).toBe("张三");
  });

  it("submits current named form values through the host chat sender", () => {
    const sendMessage = vi.fn(() => true);
    (window as any).QwenPaw.chat = { sendMessage };
    const node: GenUiNode = {
      nodeId: "form1", kind: "Form",
      props: { title: "登记", submitLabel: "提交", action: { type: "send_message", payload: { content: "姓名={{name}}，阶段={{phase}}" } } },
      children: [
        { nodeId: "name", kind: "Input", props: { name: "name", label: "姓名", required: true }, children: [] },
        { nodeId: "phase", kind: "Select", props: { name: "phase", label: "阶段", value: "一期", options: ["一期", "二期"] }, children: [] },
      ],
    };
    const { getByLabelText, getByText } = render(React.createElement(GenUiTreeView, { node }));
    fireEvent.change(getByLabelText("姓名"), { target: { value: "张三" } });
    fireEvent.click(getByText("提交"));
    expect(sendMessage).toHaveBeenCalledWith("姓名=张三，阶段=一期");
    expect(getByText("已提交")).toBeTruthy();
  });

  it("blocks a required form submission and shows feedback", () => {
    const sendMessage = vi.fn(() => true);
    (window as any).QwenPaw.chat = { sendMessage };
    const node: GenUiNode = { nodeId: "form1", kind: "Form", props: {}, children: [
      { nodeId: "name", kind: "Input", props: { name: "name", label: "姓名", required: true }, children: [] },
    ] };
    const { getByText } = render(React.createElement(GenUiTreeView, { node }));
    fireEvent.click(getByText("提交"));
    expect(sendMessage).not.toHaveBeenCalled();
    expect(getByText("姓名不能为空")).toBeTruthy();
  });

  it("uses a field label as a readable legacy form key", () => {
    const sendMessage = vi.fn(() => true);
    (window as any).QwenPaw.chat = { sendMessage };
    const node: GenUiNode = { nodeId: "form1", kind: "Form", props: { action: { type: "submit_form" } }, children: [
      { nodeId: "generated-id", kind: "Input", props: { label: "姓名", value: "默认用户" }, children: [] },
    ] };
    const { getByText } = render(React.createElement(GenUiTreeView, { node }));
    fireEvent.click(getByText("提交"));
    expect(sendMessage).toHaveBeenCalledWith(expect.stringContaining("姓名: 默认用户"));
  });

  it("updates standalone switch and slider controls", () => {
    const tree: GenUiNode = { nodeId: "stack", kind: "Stack", props: {}, children: [
      { nodeId: "switch", kind: "Switch", props: { label: "启用", checked: false }, children: [] },
      { nodeId: "slider", kind: "Slider", props: { label: "阈值", value: 20, min: 0, max: 100 }, children: [] },
    ] };
    const { container, getByRole } = render(React.createElement(GenUiTreeView, { node: tree }));
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    const slider = getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "65" } });
    expect(slider.value).toBe("65");
  });

  it("recomputes a polynomial chart when a coefficient slider changes", () => {
    const tree: GenUiNode = { nodeId: "root", kind: "Stack", props: {}, children: [
      { nodeId: "a", kind: "Slider", props: { name: "a", label: "a", value: 1, min: -2, max: 2, step: 0.1 }, children: [] },
      { nodeId: "b", kind: "Slider", props: { name: "b", label: "b", value: 0 }, children: [] },
      { nodeId: "c", kind: "Slider", props: { name: "c", label: "c", value: -4 }, children: [] },
      { nodeId: "d", kind: "Slider", props: { name: "d", label: "d", value: 0 }, children: [] },
      { nodeId: "e", kind: "Slider", props: { name: "e", label: "e", value: 2 }, children: [] },
      { nodeId: "chart", kind: "Chart", props: { chart: "line", generator: { type: "polynomial", coefficients: ["a", "b", "c", "d", "e"], xMin: -2, xMax: 2, samples: 21 } }, children: [] },
    ] };
    const { container, getAllByRole } = render(
      React.createElement(GenUiInteractionProvider, { node: tree }, React.createElement(GenUiTreeView, { node: tree })),
    );
    const before = container.querySelector("polyline")?.getAttribute("points");
    fireEvent.change(getAllByRole("slider")[0], { target: { value: "-1" } });
    const after = container.querySelector("polyline")?.getAttribute("points");
    expect(after).not.toBe(before);
  });
});

afterEach(() => {
  delete (window as any).QwenPaw;
});

describe("GenUiTreeView — Unknown Nodes", () => {
  it("renders unknown kind without crashing", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "NonExistentKind" as any,
      props: { foo: "bar" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Unknown component: NonExistentKind");
  });

  it("renders unknown kind with dashed border style", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "FakeComponent" as any,
      props: {},
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.style.border).toContain("dashed");
  });

  it("does not render raw HTML for unknown kind", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "<script>alert(1)</script>" as any,
      props: {},
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    // React escapes HTML by default
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("Unknown component: <script>alert(1)</script>");
  });
});

describe("GenUiTreeView — Known Nodes", () => {
  it("renders Stack with children", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Stack",
      props: { gap: 12 },
      children: [
        { nodeId: "n2", kind: "Text", props: { value: "Hello" }, children: [] },
      ],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Hello");
    const stackDiv = container.querySelector("div");
    expect(stackDiv).not.toBeNull();
  });

  it("renders Text with value", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Text",
      props: { value: "Hello World", size: "lg" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Hello World");
  });

  it("renders Heading with value", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Heading",
      props: { level: 2, value: "Section Title" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Section Title");
  });

  it("renders Badge with value", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Badge",
      props: { value: "New" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("New");
  });

  it("renders Card with title and children", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Card",
      props: { title: "My Card" },
      children: [
        { nodeId: "n2", kind: "Text", props: { value: "Content" }, children: [] },
      ],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("My Card");
    expect(container.textContent).toContain("Content");
  });

  it("renders MetricCard with title and value", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "MetricCard",
      props: { title: "Revenue", value: "$42K", delta: "+12%", trend: "up" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Revenue");
    expect(container.textContent).toContain("$42K");
    expect(container.textContent).toContain("+12%");
  });

  it("renders CodeBlock with code", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "CodeBlock",
      props: { code: "console.log('hello')", language: "javascript" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("console.log('hello')");
  });

  it("renders JsonDebug with data", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "JsonDebug",
      props: { label: "Debug Info", data: { key: "value" } },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Debug Info");
    expect(container.textContent).toContain("key");
    expect(container.textContent).toContain("value");
  });
});

describe("GenUiTreeView — Chart Rendering", () => {
  it("renders line chart with SVG", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "line",
        title: "Revenue Trend",
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        series: [{ name: "Revenue", values: [100, 200, 150, 300, 250] }],
        height: 200,
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Revenue Trend");
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("polyline")).not.toBeNull();
  });

  it("renders bar chart with SVG", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "bar",
        categories: ["A", "B", "C"],
        series: [{ name: "Values", values: [10, 20, 30] }],
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBeGreaterThan(0);
  });

  it("anchors positive and negative bars at the zero baseline", () => {
    const node: GenUiNode = {
      nodeId: "n1", kind: "Chart",
      props: { chart: "bar", categories: ["A", "B"], series: [{ name: "Values", values: [-10, 10] }], height: 200 },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    const bars = Array.from(container.querySelectorAll("rect"));
    expect(bars).toHaveLength(2);
    expect(Number(bars[0].getAttribute("y"))).toBe(100);
    expect(Number(bars[1].getAttribute("y"))).toBe(20);
    expect(Number(bars[0].getAttribute("height"))).toBe(80);
    expect(Number(bars[1].getAttribute("height"))).toBe(80);
  });

  it("renders pie chart with SVG", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "pie",
        categories: ["A", "B", "C"],
        series: [{ name: "Values", values: [30, 40, 30] }],
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("renders area chart with SVG", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "area",
        categories: ["A", "B", "C"],
        series: [{ name: "Values", values: [10, 20, 15] }],
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("polygon")).not.toBeNull();
  });

  it("renders chart with no data gracefully", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: { chart: "line" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("no data");
  });

  it("renders chart legend by default", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "line",
        categories: ["A", "B"],
        series: [{ name: "Series 1", values: [1, 2] }],
        showLegend: true,
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Series 1");
  });

  it("hides legend when showLegend is false", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Chart",
      props: {
        chart: "line",
        categories: ["A", "B"],
        series: [{ name: "Series 1", values: [1, 2] }],
        showLegend: false,
      },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).not.toContain("Series 1");
  });
});

describe("GenUiTreeView — Edge Cases", () => {
  it("handles missing props gracefully", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Text",
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container).toBeDefined();
  });

  it("handles missing children gracefully", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Stack",
      props: {},
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container).toBeDefined();
  });

  it("handles empty children array", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Stack",
      props: {},
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container).toBeDefined();
  });

  it("handles null/undefined props values", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Text",
      props: { value: null as any, size: undefined as any },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container).toBeDefined();
  });

  it("renders nested unknown nodes safely", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Stack",
      props: {},
      children: [
        { nodeId: "n2", kind: "FakeKind" as any, props: {}, children: [] },
        { nodeId: "n3", kind: "Text", props: { value: "OK" }, children: [] },
      ],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Unknown component: FakeKind");
    expect(container.textContent).toContain("OK");
  });

  it("returns null when host React is not available", () => {
    delete (window as any).QwenPaw;
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Stack",
      props: {},
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.innerHTML).toBe("");
  });

  it("renders Image with src and alt", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Image",
      props: { src: "https://example.com/img.png", alt: "Test Image" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe("https://example.com/img.png");
    expect(img!.getAttribute("alt")).toBe("Test Image");
  });

  it("renders Image with caption", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Image",
      props: { src: "https://example.com/img.png", caption: "Figure 1" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Figure 1");
  });

  it("renders Button with label", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Button",
      props: { label: "Click Me", variant: "primary" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Click Me");
  });

  it("renders Alert with message", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Alert",
      props: { title: "Warning", message: "Something went wrong", severity: "warning" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Warning");
    expect(container.textContent).toContain("Something went wrong");
  });

  it("renders Grid with columns", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Grid",
      props: { columns: 3, gap: 12 },
      children: [
        { nodeId: "n2", kind: "Text", props: { value: "A" }, children: [] },
        { nodeId: "n3", kind: "Text", props: { value: "B" }, children: [] },
      ],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("A");
    expect(container.textContent).toContain("B");
  });

  it("renders Spacer with size", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Spacer",
      props: { size: 32 },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    const spacer = container.querySelector("div");
    expect(spacer).not.toBeNull();
    expect(spacer!.style.height).toContain("32px");
  });

  it("renders Progress with value", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Progress",
      props: { value: 75, label: "Loading" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("75");
  });

  it("renders Markdown with content", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Markdown",
      props: { content: "# Hello World" },
      children: [],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Hello World");
  });

  it("renders Table with headers and rows", () => {
    const node: GenUiNode = {
      nodeId: "n1",
      kind: "Table",
      props: { headers: ["Name", "Value"] },
      children: [
        {
          nodeId: "n2",
          kind: "TableRow",
          props: {},
          children: [
            { nodeId: "n3", kind: "TableCell", props: { value: "Foo" }, children: [] },
            { nodeId: "n4", kind: "TableCell", props: { value: "42" }, children: [] },
          ],
        },
      ],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("Name");
    expect(container.textContent).toContain("Value");
    expect(container.textContent).toContain("Foo");
    expect(container.textContent).toContain("42");
  });

  it("preserves zero and false table cell values", () => {
    const node: GenUiNode = {
      nodeId: "n1", kind: "Table", props: { headers: ["Zero", "False"] },
      children: [{
        nodeId: "row", kind: "TableRow", props: {}, children: [
          { nodeId: "zero", kind: "TableCell", props: { value: 0 }, children: [] },
          { nodeId: "false", kind: "TableCell", props: { value: false }, children: [] },
        ],
      }],
    };
    const { container } = render(React.createElement(GenUiTreeView, { node }));
    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("false");
  });
});
