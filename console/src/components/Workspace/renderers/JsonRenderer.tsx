/** JsonRenderer — JSON 树形查看器，复用 Monaco Editor JSON 模式 */
import React from "react";
import CodeRenderer from "./CodeRenderer";
import type { RendererContext } from "../types";

const JsonRenderer: React.FC<RendererContext> = (props) => {
  // JSON 使用 CodeRenderer + JSON 语言模式
  return <CodeRenderer {...props} />;
};

export default JsonRenderer;
