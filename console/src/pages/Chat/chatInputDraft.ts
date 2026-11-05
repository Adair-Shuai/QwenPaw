/**
 * Chat input draft persistence.
 *
 * The key helpers and `useChatInputDraft` live here so the composer contract
 * can be tested without rendering the Chat page.
 *
 * Regressions guarded here:
 * - A#82689956: drafts must be isolated per agent (the storage key carries the
 *   agent id), otherwise switching agents leaks one agent's draft into
 *   another's input box.
 * - #8351: every conversation of one agent used to share
 *   `qwenpaw_chat_input_draft_<agentId>`. A real session id is part of the
 *   key, including when no agent id is selected. That legacy entry is
 *   discarded, never copied: it has no conversation identity, so migrating
 *   it would put stale text in whichever chat opened next. Each
 *   not-yet-created composer gets
 *   `qwenpaw_chat_input_draft_<agentId>_pending_<clientSideId>`. The id lives
 *   in sessionStorage, so leaving and returning restores that composer
 *   (#4774). Starting another new chat rotates the id. The draft is handed
 *   to the real session key once an id is allocated, then the pending slot
 *   is removed.
 * - #4774: navigating away and back must restore the draft exactly (value +
 *   cursor selection), and malformed/empty stored data must never throw.
 * - #8272: sending clears only the current conversation's draft.
 */

import { useEffect, useState } from "react";
import { useLoopStore } from "../../stores/loopStore";
import { setTextareaValue } from "./utils";

export const DRAFT_STORAGE_KEY_PREFIX = "qwenpaw_chat_input_draft";

/** Sidebar sets this before navigating to /chat from another page. */
const PENDING_NEW_CHAT_FLAG = "qwenpaw_pending_new_chat";

/** sessionStorage key for the active pre-creation composer id. */
const PENDING_COMPOSER_ID_PREFIX = "qwenpaw_chat_input_pending_composer";

const PENDING_COMPOSER_ROTATED_EVENT = "qwenpaw:pending-composer-rotated";

export interface DraftState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Pre-#8351 key. Callers must not restore this into a composer. */
export function getLegacyDraftStorageKey(agentId?: string): string {
  return agentId
    ? `${DRAFT_STORAGE_KEY_PREFIX}_${agentId}`
    : DRAFT_STORAGE_KEY_PREFIX;
}

function pendingComposerStorageKey(agentId?: string): string {
  return agentId
    ? `${PENDING_COMPOSER_ID_PREFIX}_${agentId}`
    : PENDING_COMPOSER_ID_PREFIX;
}

function pendingComposerArmedKey(agentId?: string): string {
  return `${pendingComposerStorageKey(agentId)}_armed`;
}

function createPendingComposerId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isBlankDraftSession(sessionId?: string): boolean {
  return !sessionId || sessionId === "new";
}

/**
 * Sidebar sets `qwenpaw_pending_new_chat` before navigating back to `/chat`.
 * Mint once, before the composer reads storage, so the previous new chat is
 * not restored. ChatSessionInitializer still owns removing the flag.
 */
function claimFreshPendingComposer(agentId?: string): void {
  const armedKey = pendingComposerArmedKey(agentId);
  if (sessionStorage.getItem(PENDING_NEW_CHAT_FLAG) !== "1") {
    sessionStorage.removeItem(armedKey);
    return;
  }
  if (sessionStorage.getItem(armedKey) === "1") return;
  sessionStorage.setItem(armedKey, "1");
  sessionStorage.setItem(
    pendingComposerStorageKey(agentId),
    createPendingComposerId(),
  );
}

export function getPendingComposerId(agentId?: string): string {
  claimFreshPendingComposer(agentId);
  const key = pendingComposerStorageKey(agentId);
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = createPendingComposerId();
  sessionStorage.setItem(key, id);
  return id;
}

/** Start a different pre-creation composer. The previous slot is left intact. */
export function rotatePendingComposer(agentId?: string): string {
  const id = createPendingComposerId();
  sessionStorage.setItem(pendingComposerStorageKey(agentId), id);
  window.dispatchEvent(
    new CustomEvent(PENDING_COMPOSER_ROTATED_EVENT, {
      detail: { agentId: agentId ?? "" },
    }),
  );
  return id;
}

/**
 * Storage key for one conversation's draft.
 *
 * - No real session (missing, empty, or the explicit "new" route): this
 *   composer's pending slot. `/chat` and `/chat/new` share it until a new
 *   chat rotates the id. This is not the legacy per-agent key and not the
 *   old shared `__pending` slot.
 * - Real session: `qwenpaw_chat_input_draft_<agentId>_<sessionId>`.
 *   A session id is still appended when the agent id is missing.
 */
export function getDraftStorageKey(
  agentId?: string,
  sessionId?: string,
): string {
  const base = getLegacyDraftStorageKey(agentId);
  if (isBlankDraftSession(sessionId)) {
    return `${base}_pending_${getPendingComposerId(agentId)}`;
  }
  return `${base}_${sessionId}`;
}

/**
 * Drop entries that have no conversation identity.
 *
 * The pre-#8351 per-agent key and the shared `__pending` slot were visible
 * to every composer of that agent. Copying either into the chat that happens
 * to open next would resurface text in an unrelated conversation, so both
 * are deleted and never migrated.
 */
export function discardLegacyDraft(agentId?: string): void {
  const legacy = getLegacyDraftStorageKey(agentId);
  const current = getDraftStorageKey(agentId);
  if (legacy !== current) localStorage.removeItem(legacy);
  const sharedPending = `${legacy}__pending`;
  if (sharedPending !== current) localStorage.removeItem(sharedPending);
}

/**
 * Move the active pre-creation draft onto a session that was just allocated.
 * Does not copy the legacy per-agent entry or any other composer's slot.
 * Drops this composer's pending slot so a later blank chat does not inherit
 * the text. Does not rotate the composer id: the route is about to become
 * the real session, and rotating here would clear the composer first.
 */
export function handoverDraftToSession(
  agentId: string | undefined,
  sessionId: string,
): void {
  if (!sessionId || sessionId === "new") return;
  const fromKey = getDraftStorageKey(agentId);
  const toKey = getDraftStorageKey(agentId, sessionId);
  if (fromKey !== toKey) {
    const pending = localStorage.getItem(fromKey);
    if (pending && !localStorage.getItem(toKey)) {
      localStorage.setItem(toKey, pending);
    }
    localStorage.removeItem(fromKey);
  }
  discardLegacyDraft(agentId);
}

/**
 * Serializes a draft for persistence. Returns null when the value is empty —
 * callers must treat null as "remove the stored draft" (a leftover stale
 * draft would resurface on the next visit, regression #4774).
 */
export function serializeDraft(draft: DraftState): string | null {
  return draft.value ? JSON.stringify(draft) : null;
}

/**
 * Parses a stored draft. Returns null for missing, malformed, or empty
 * values — restore must fail soft and never throw on corrupted storage.
 */
export function parseDraft(raw: string | null): DraftState | null {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as DraftState;
    return draft.value ? draft : null;
  } catch {
    return null;
  }
}

export function useChatInputDraft(
  active: boolean,
  agentId?: string,
  sessionId?: string,
) {
  const blank = isBlankDraftSession(sessionId);
  const [, bumpPendingComposer] = useState(0);
  const storageKey = getDraftStorageKey(agentId, sessionId);

  useEffect(() => {
    const onRotated = (event: Event) => {
      const detail = (event as CustomEvent<{ agentId?: string }>).detail;
      if ((detail?.agentId ?? "") !== (agentId ?? "")) return;
      bumpPendingComposer((epoch) => epoch + 1);
    };
    const onNewChat = () => {
      if (!blank) return;
      rotatePendingComposer(agentId);
    };
    window.addEventListener(PENDING_COMPOSER_ROTATED_EVENT, onRotated);
    window.addEventListener("qwenpaw:sidebar-new-chat", onNewChat);
    return () => {
      window.removeEventListener(PENDING_COMPOSER_ROTATED_EVENT, onRotated);
      window.removeEventListener("qwenpaw:sidebar-new-chat", onNewChat);
    };
  }, [agentId, blank]);

  useEffect(() => {
    if (!active) return;
    // Ignore a pre-#8351 per-agent entry instead of restoring it (#8351).
    discardLegacyDraft(agentId);

    const getTextarea = (): HTMLTextAreaElement | null =>
      document.querySelector<HTMLTextAreaElement>(
        'textarea[data-sender-input="true"]',
      ) ??
      document.querySelector<HTMLTextAreaElement>('[class*="sender"] textarea');

    // Read before listening so a session switch cannot capture the previous
    // conversation's value. New SDK nodes re-read authoritative storage below.
    const storedDraft = parseDraft(localStorage.getItem(storageKey));
    let restoring = false;
    let disposed = false;
    const restoredTextareas = new WeakSet<HTMLTextAreaElement>();
    const editedTextareas = new WeakSet<HTMLTextAreaElement>();
    const selectionFrames = new Set<number>();

    const saveDraft = (textarea: HTMLTextAreaElement) => {
      const draft: DraftState = {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      };
      const serialized = serializeDraft(draft);
      if (serialized) {
        localStorage.setItem(storageKey, serialized);
      } else {
        localStorage.removeItem(storageKey);
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.tagName !== "TEXTAREA") return;
      if (target !== getTextarea()) return;

      if (!restoring) {
        const textarea = target as HTMLTextAreaElement;
        // Even an intentional empty edit wins over an older stored snapshot.
        restoredTextareas.add(textarea);
        editedTextareas.add(textarea);
        saveDraft(textarea);
      }

      // Minimal loop mode detection: sync indicator with availableModes
      const val = (target as HTMLTextAreaElement).value.trimStart();
      const modes = useLoopStore.getState().availableModes;
      const match = modes.find((m) => {
        if (!m.slash_command) return false;
        const prefix = `/${m.slash_command}`;
        // Match "/cmd" or "/cmd " exactly, avoid "/cmdxxx"
        return val === prefix || val.startsWith(`${prefix} `);
      });
      if (match) useLoopStore.getState().setSelectedMode(match.id);
    };

    const applyStoredDraft = (
      textarea: HTMLTextAreaElement,
      replacePreviousSession = false,
    ) => {
      if (disposed || restoredTextareas.has(textarea)) return;
      restoredTextareas.add(textarea);
      // A late-mounted sender may already contain a newer user revision.
      if (!replacePreviousSession && textarea.value) return;
      // Admission can remove the persisted draft without dispatching input;
      // another window can also update it. Never resurrect a cached snapshot.
      const draft = replacePreviousSession
        ? storedDraft
        : parseDraft(localStorage.getItem(storageKey));
      if (!draft && (!replacePreviousSession || !textarea.value)) return;

      // Sync SDK state through its real input event without re-saving the
      // temporary end-of-text cursor created by setTextareaValue.
      restoring = true;
      try {
        setTextareaValue(textarea, draft?.value ?? "");
      } finally {
        restoring = false;
      }
      if (!draft) return;
      const frame = requestAnimationFrame(() => {
        selectionFrames.delete(frame);
        if (
          disposed ||
          !textarea.isConnected ||
          editedTextareas.has(textarea) ||
          textarea.value !== draft.value
        )
          return;
        textarea.setSelectionRange(draft.selectionStart, draft.selectionEnd);
      });
      selectionFrames.add(frame);
    };

    document.addEventListener("input", handleInput, true);

    // Session navigation reuses the existing sender; replace the previous
    // session's content before another keystroke can reach it.
    const existingTextarea = getTextarea();
    if (existingTextarea) applyStoredDraft(existingTextarea, true);

    // SDK initialization and remounts have no fixed time limit. Discover each
    // new input once; DOM updates on an existing input never rewrite its draft.
    const observer = new MutationObserver(() => {
      const textarea = getTextarea();
      if (textarea) applyStoredDraft(textarea);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
      for (const frame of selectionFrames) cancelAnimationFrame(frame);
      document.removeEventListener("input", handleInput, true);

      // Input events already saved the draft. Cleanup must not overwrite it
      // with a cleared/remounted composer (including another browser tab).
    };
  }, [active, agentId, storageKey]);
}
