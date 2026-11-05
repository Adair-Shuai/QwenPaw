const React = window.QwenPaw.host.React;
const { useRef, useLayoutEffect } = React;

function readTemplate(element) {
  function read(node) {
    if (node.nodeType === 3) return node.textContent.replace(/\u00a0/g, " ");
    if (node.nodeType !== 1) return "";
    if (node.dataset.reference) return "【" + node.dataset.reference + "】";
    if (node.tagName === "BR") return "\n";
    return [...node.childNodes]
      .map((child, index) => {
        const block = child.nodeType === 1 && /^(DIV|P)$/.test(child.tagName);
        return (block && index > 0 ? "\n" : "") + read(child);
      })
      .join("");
  }
  return read(element);
}

export default function LinkedOpinion({ field, inputId, onChange }) {
  const editor = useRef(null);
  useLayoutEffect(() => {
    const element = editor.current;
    const tokens = [...element.querySelectorAll("[data-reference]")];
    const parts = field.linked_parts.filter((part) => typeof part === "object");
    if (
      readTemplate(element) === field.linked_template &&
      tokens.length === parts.length &&
      tokens.every(
        (token, i) => token.textContent === "【" + parts[i].value + "】",
      )
    )
      return;
    const fragment = document.createDocumentFragment();
    for (const part of field.linked_parts) {
      if (typeof part === "string")
        fragment.append(document.createTextNode(part));
      else {
        const token = document.createElement("span");
        token.className = "df-reference-token";
        token.dataset.reference = part.field;
        token.setAttribute("contenteditable", "false");
        token.title = part.label + " · 自动关联";
        token.setAttribute("aria-label", part.label + "：" + part.value);
        token.textContent = "【" + part.value + "】";
        fragment.append(token);
      }
    }
    element.replaceChildren(fragment);
  }, [field.linked_template, field.linked_parts]);
  function changed() {
    const template = readTemplate(editor.current);
    onChange(field.value, template);
  }
  return (
    <div
      id={inputId}
      ref={editor}
      className="df-linked-editor"
      role="textbox"
      aria-label={field.label}
      aria-multiline="true"
      aria-required={field.required || undefined}
      contentEditable
      suppressContentEditableWarning
      onInput={changed}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (
          !selection?.rangeCount ||
          !editor.current.contains(selection.anchorNode)
        )
          return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        changed();
      }}
    />
  );
}
