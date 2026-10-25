import React from "react";

/** Structured predicates with an advanced editor for nested logical expressions. */
export function ConditionFields({
  value,
  onChange,
  targets,
  antd,
}: {
  value: any;
  onChange: (conditions: any[]) => void;
  targets: { label: string; value: string }[];
  antd: any;
}) {
  const { Button, Input, Select, Form, Typography, Collapse, Alert } = antd;
  const conditions: any[] = Array.isArray(value) ? value : [];
  const change = (index: number, patch: any) =>
    onChange(
      conditions.map((condition, i) =>
        i === index ? { ...condition, ...patch } : condition,
      ),
    );
  const operators = [
    { value: "eq", label: "等于" },
    { value: "ne", label: "不等于" },
    { value: "gt", label: "大于" },
    { value: "ge", label: "大于等于" },
    { value: "lt", label: "小于" },
    { value: "le", label: "小于等于" },
    { value: "contains", label: "包含" },
    { value: "is_null", label: "为空" },
    { value: "is_not_null", label: "不为空" },
  ];
  return (
    <div style={{ marginBottom: 18 }}>
      <Typography.Title level={5}>条件分支</Typography.Title>
      {!Array.isArray(value) && value !== undefined && (
        <Alert type="error" message="条件配置应为数组，请修正配置" />
      )}
      {conditions.map((condition, index) => {
        const expression = condition.if || condition.if_expr || {};
        const compound = ["and", "or", "not"].includes(expression.operator);
        const editExpression = (key: string, item: any) =>
          change(index, {
            if: { ...expression, [key]: item },
            if_expr: undefined,
          });
        return (
          <div className="ff-condition" key={index}>
            <Typography.Text strong>分支 {index + 1}</Typography.Text>
            {compound ? (
              <Alert
                type="info"
                message="复合逻辑条件"
                description="使用下方高级配置编辑嵌套条件。"
              />
            ) : (
              <>
                <Form.Item label="比较变量" style={{ margin: "10px 0" }}>
                  <Input
                    value={expression.left || ""}
                    placeholder="如 inventory.pressure"
                    onChange={(event: any) =>
                      editExpression("left", event.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="判断条件" style={{ marginBottom: 10 }}>
                  <Select
                    value={expression.operator || "eq"}
                    options={operators}
                    onChange={(item: string) =>
                      editExpression("operator", item)
                    }
                  />
                </Form.Item>
                {!["is_null", "is_not_null"].includes(expression.operator) && (
                  <Form.Item
                    label="比较值（数字、布尔值或文本）"
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      value={
                        typeof expression.right === "object"
                          ? JSON.stringify(expression.right)
                          : String(expression.right ?? "")
                      }
                      onChange={(event: any) => {
                        let item: any = event.target.value;
                        try {
                          item = JSON.parse(item);
                        } catch {
                          /* Keep literal string values. */
                        }
                        editExpression("right", item);
                      }}
                    />
                  </Form.Item>
                )}
              </>
            )}
            <Form.Item label="满足条件后执行" style={{ marginBottom: 10 }}>
              <Select
                value={condition.then_node || condition.then}
                options={targets}
                placeholder="选择目标节点"
                showSearch
                optionFilterProp="label"
                onChange={(target: string) =>
                  change(index, { then_node: target, then: undefined })
                }
              />
            </Form.Item>
            <Collapse
              ghost
              items={[
                {
                  key: "advanced",
                  label: "高级条件配置",
                  children: (
                    <Input.TextArea
                      defaultValue={JSON.stringify(expression, null, 2)}
                      key={JSON.stringify(expression)}
                      autoSize={{ minRows: 3, maxRows: 12 }}
                      onBlur={(event: any) => {
                        try {
                          const parsed = JSON.parse(event.target.value);
                          change(index, { if: parsed, if_expr: undefined });
                        } catch {
                          antd.message.error("条件 JSON 格式错误，尚未应用");
                        }
                      }}
                    />
                  ),
                },
              ]}
            />
            <Button
              danger
              size="small"
              onClick={() => onChange(conditions.filter((_, i) => i !== index))}
            >
              删除分支
            </Button>
          </div>
        );
      })}
      <Button
        block
        type="dashed"
        onClick={() =>
          onChange([
            ...conditions,
            { if: { left: "", operator: "eq", right: "" } },
          ])
        }
      >
        + 添加条件分支
      </Button>
    </div>
  );
}
