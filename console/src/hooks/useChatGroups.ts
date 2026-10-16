import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatGroup } from "../api/types/chat";
import { chatApi } from "../api/modules/chat";
import { useAgentStore } from "../stores/agentStore";

export interface ChatGroupsState {
  groups: ChatGroup[];
  loading: boolean;
  refreshGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  renameGroup: (groupId: string, name: string) => Promise<void>;
  pinGroup: (groupId: string, pinned: boolean) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  reorderGroups: (groupIds: string[]) => Promise<void>;
}

export function useChatGroups(active = true): ChatGroupsState {
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const scope = useMemo(
    () => ({ agentId: selectedAgent, active, live: false }),
    [selectedAgent, active],
  );
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const revision = useRef(0);
  const isCurrent = useCallback(
    () => scope.live && scope.active && currentScope.current === scope,
    [scope],
  );

  const refreshGroups = useCallback(async () => {
    if (!isCurrent()) return;
    const requestRevision = ++revision.current;
    setLoading(true);
    try {
      const next = await chatApi.listGroups();
      if (isCurrent() && revision.current === requestRevision) setGroups(next);
    } finally {
      if (isCurrent() && revision.current === requestRevision)
        setLoading(false);
    }
  }, [isCurrent]);

  useEffect(() => {
    scope.live = true;
    if (active) {
      setGroups([]);
      void refreshGroups().catch((error: unknown) => {
        console.error("Failed to load chat groups:", error);
      });
    }
    return () => {
      scope.live = false;
      revision.current += 1;
    };
  }, [active, scope, refreshGroups]);

  const createGroup = useCallback(
    async (name: string) => {
      await chatApi.createGroup(name);
      await refreshGroups();
    },
    [refreshGroups],
  );

  const renameGroup = useCallback(
    async (groupId: string, name: string) => {
      await chatApi.updateGroup(groupId, { name });
      await refreshGroups();
    },
    [refreshGroups],
  );

  const pinGroup = useCallback(
    async (groupId: string, pinned: boolean) => {
      await chatApi.updateGroup(groupId, { pinned });
      await refreshGroups();
    },
    [refreshGroups],
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      await chatApi.deleteGroup(groupId);
      await refreshGroups();
    },
    [refreshGroups],
  );

  const reorderGroups = useCallback(
    async (groupIds: string[]) => {
      if (!isCurrent()) return;
      const requestRevision = ++revision.current;
      try {
        const next = await chatApi.reorderGroups(groupIds);
        if (isCurrent() && revision.current === requestRevision)
          setGroups(next);
      } finally {
        if (isCurrent() && revision.current === requestRevision)
          setLoading(false);
      }
    },
    [isCurrent],
  );

  return {
    groups,
    loading,
    refreshGroups,
    createGroup,
    renameGroup,
    pinGroup,
    deleteGroup,
    reorderGroups,
  };
}
