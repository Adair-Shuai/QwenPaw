export function refreshLinkedFields(fields) {
  const values = Object.fromEntries(
    fields.map((field) => [field.key, field.value]),
  );
  return fields.map((field) => {
    if (field.linked_template === undefined || !field.linked_variables)
      return field;
    const variables = { ...field.linked_variables, ...values };
    const parts = [];
    let cursor = 0;
    for (const match of field.linked_template.matchAll(
      /【([a-z][a-z0-9_.]*(?:\|[0-6])?)】/g,
    )) {
      const [base, precision] = match[1].split("|");
      if (!(base in field.linked_variables)) continue;
      parts.push(field.linked_template.slice(cursor, match.index));
      const previous = field.linked_parts.find(
        (part) => typeof part === "object" && part.field.split("|")[0] === base,
      );
      let value = variables[base]?.trim();
      if (precision && value && /^-?\d+(?:\.\d+)?$/.test(value)) {
        const [whole, fraction = ""] = value.split(".");
        value = whole + "." + fraction.padEnd(Number(precision), "0");
      }
      parts.push({
        field: match[1],
        label: previous?.label || base,
        value: value || `（${previous?.label || "引用资料"}待填写）`,
      });
      cursor = match.index + match[0].length;
    }
    parts.push(field.linked_template.slice(cursor));
    const value = parts
      .map((part) => (typeof part === "string" ? part : part.value))
      .join("");
    return { ...field, linked_parts: parts, linked_rendered: value, value };
  });
}
