/**
 * readerComposerBridge — PDF 阅读器与聊天输入框的桥接
 *
 * 设计灵感来自 LeAgent 的 readerComposerBridge.ts：
 * - 用户在 PDF 阅读器中选中文字或点击「问 AI」时，
 *   将 PDF 上下文（文件名、页码、选中文字、页面文本）注入聊天输入框
 * - 使用事件总线模式，避免组件直接耦合
 * - 支持多个监听者（如笔记面板、研究面板）
 */

import type { PdfContextPayload } from "./types";

type Listener = (payload: PdfContextPayload) => void;

class ReaderComposerBridge {
  private listeners = new Set<Listener>();

  /** 订阅 PDF 上下文注入事件 */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** 发布 PDF 上下文（触发所有监听者） */
  publish(payload: PdfContextPayload): void {
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.warn("[ReaderComposerBridge] listener error:", err);
      }
    });
  }

  /** 构建发送给 AI 的上下文文本 */
  buildContextText(payload: PdfContextPayload): string {
    const parts: string[] = [];
    parts.push(`📄 ${payload.fileName || "PDF Document"}`);
    parts.push(`页码: ${payload.currentPage}/${payload.numPages}`);
    if (payload.paperTitle) {
      parts.push(`标题: ${payload.paperTitle}`);
    }
    if (payload.selectedText) {
      parts.push(`\n选中内容:\n> ${payload.selectedText}`);
    } else if (payload.pageText) {
      // 只取前 2000 字符避免过长
      const text = payload.pageText.slice(0, 2000);
      parts.push(`\n当前页文本:\n${text}`);
    }
    return parts.join("\n");
  }
}

/** 单例桥接器 */
export const readerComposerBridge = new ReaderComposerBridge();
