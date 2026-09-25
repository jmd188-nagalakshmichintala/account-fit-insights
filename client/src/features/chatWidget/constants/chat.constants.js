// Agent mode's /responses call is synchronous, so the only "active" status a
// message ever has client-side is the temporary placeholder set while the
// request is in flight — there's no more server-side polling status enum.
export const ACTIVE_MESSAGE_STATUSES = ["IN_PROGRESS"];

export const CHAT_OPEN_STORAGE_KEY = "chatWidget:open";
