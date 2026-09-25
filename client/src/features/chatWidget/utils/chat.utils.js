/**
 * Genie message objects key off `message_id`; `id` is a legacy alias this
 * workspace's API doesn't always populate.
 */
export function messageKey(message) {
  return message.message_id ?? message.id;
}

export function tempMessageId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function statusTextFromReasoning(item) {
  return (item.content ?? [])
    .map((part) => part.text)
    .filter(Boolean)
    .join(" ");
}

export function statusTextFromQuery(item) {
  try {
    const { title } = JSON.parse(item.arguments ?? "{}");
    return title ? `Running query: ${title}` : "Running query...";
  } catch {
    return "Running query...";
  }
}

/**
 * Genie surfaces suggested next questions as a `suggested_questions`
 * attachment alongside a message's answer, rather than as a top-level field.
 */
export function getSuggestedQuestions(message) {
  for (const attachment of message?.attachments ?? []) {
    if (attachment.suggested_questions?.questions?.length) {
      return attachment.suggested_questions.questions;
    }
  }
  return [];
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Buckets conversations into Today / Yesterday / Older by last activity. */
export function groupConversationsByDate(conversations) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Older: [] };

  for (const conversation of conversations) {
    const timestamp =
      conversation.last_updated_timestamp ?? conversation.created_timestamp;
    const date = timestamp ? new Date(timestamp) : null;

    if (date && isSameDay(date, now)) {
      groups.Today.push(conversation);
    } else if (date && isSameDay(date, yesterday)) {
      groups.Yesterday.push(conversation);
    } else {
      groups.Older.push(conversation);
    }
  }

  return groups;
}
