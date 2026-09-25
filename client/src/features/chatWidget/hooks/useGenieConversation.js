import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchEventStream, fetchJson } from "@/services/apiClient";
import {
  API_ENDPOINTS,
  QUERY_KEYS,
  STALE_TIME,
} from "@/constants/api.constants";

export function streamMessage(
  { content, conversationId, signal },
  { onItem, onDone, onError },
) {
  return fetchEventStream(
    API_ENDPOINTS.chatMessages,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, conversationId }),
      signal,
    },
    (eventType, data) => {
      if (eventType === "item") onItem?.(data.item);
      else if (eventType === "error") onError?.(new Error(data.message));
      else if (eventType === "done") onDone?.(data.message);
    },
  ).catch((error) => onError?.(error));
}

export function useConversations() {
  return useQuery({
    queryKey: QUERY_KEYS.chatConversations,
    queryFn: () => fetchJson(API_ENDPOINTS.chatConversations),
    staleTime: STALE_TIME.short,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId) =>
      fetchJson(API_ENDPOINTS.chatConversation(conversationId), {
        method: "DELETE",
      }),
    onSuccess: (_data, conversationId) => {
      queryClient.setQueryData(QUERY_KEYS.chatConversations, (previous) =>
        previous
          ? {
              ...previous,
              conversations: (previous.conversations ?? []).filter(
                (conversation) =>
                  conversation.conversation_id !== conversationId,
              ),
            }
          : previous,
      );
    },
  });
}

export function useSpaceInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.chatSpaceInfo,
    queryFn: () => fetchJson(API_ENDPOINTS.chatSpaceInfo),
    staleTime: STALE_TIME.long,
  });
}

export function useSampleQuestions() {
  return useQuery({
    queryKey: QUERY_KEYS.chatSampleQuestions,
    queryFn: () => fetchJson(API_ENDPOINTS.chatSampleQuestions),
    staleTime: STALE_TIME.long,
  });
}

// Only needed for legacy (non-Agent-mode) messages, whose query attachments
// point at a result that has to be fetched separately (Agent mode already
// inlines its answer table as markdown text).
export function useQueryResult(
  conversationId,
  messageId,
  attachmentId,
  { enabled = true } = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.chatQueryResult(
      conversationId,
      messageId,
      attachmentId,
    ),
    queryFn: () =>
      fetchJson(
        API_ENDPOINTS.chatQueryResult(conversationId, messageId, attachmentId),
      ),
    enabled: enabled && Boolean(attachmentId),
    staleTime: STALE_TIME.long,
  });
}

export function useVisualizationImage(
  conversationId,
  messageId,
  attachmentId,
  { enabled = true } = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.chatVisualization(
      conversationId,
      messageId,
      attachmentId,
    ),
    queryFn: async () => {
      const response = await fetch(
        API_ENDPOINTS.chatDownloadVisualization(
          conversationId,
          messageId,
          attachmentId,
        ),
      );
      if (!response.ok) throw new Error("No visualization available");
      return URL.createObjectURL(await response.blob());
    },
    enabled: enabled && Boolean(attachmentId),
    retry: false,
    staleTime: Infinity,
    // Drop the cache entry on unmount so a revoked object URL isn't reused.
    gcTime: 0,
  });
}

export function useLoadConversationMessages() {
  const queryClient = useQueryClient();

  return (conversationId) =>
    queryClient.fetchQuery({
      queryKey: QUERY_KEYS.chatMessages(conversationId),
      queryFn: () =>
        fetchJson(API_ENDPOINTS.chatConversationMessages(conversationId)),
    });
}
