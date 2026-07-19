/**
 * useReaderContextInjector — 订阅 readerComposerBridge 并注入上下文到目标
 *
 * 设计要点：
 * - 解耦：hook 仅负责订阅 bridge + 构建上下文文本，具体注入逻辑由调用方提供
 * - 可复用：Chat 页面、Coding 模式内嵌 composer 均可使用
 * - 自动清理：组件卸载时取消订阅
 *
 * 用法：
 * ```tsx
 * const inject = useCallback((text: string) => {
 *   const textarea = document.querySelector('[class*="sender"] textarea');
 *   if (textarea) setTextareaValue(textarea, text);
 * }, []);
 * useReaderContextInjector(inject);
 * ```
 */
import { useEffect } from "react";
import { readerComposerBridge } from "./readerComposerBridge";

/**
 * 订阅 PDF 阅读器上下文注入事件。
 *
 * @param inject — 接收构建好的上下文文本，由调用方决定如何注入（如写入 textarea）
 */
export function useReaderContextInjector(
  inject: (contextText: string) => void,
): void {
  useEffect(() => {
    const unsubscribe = readerComposerBridge.subscribe((payload) => {
      const text = readerComposerBridge.buildContextText(payload);
      inject(text);
    });
    return unsubscribe;
  }, [inject]);
}
