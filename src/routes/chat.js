import { Router } from "express";
import {
  sendMessage,
  listConversationsHandler,
  deleteConversationHandler,
  listConversationMessagesHandler,
  getLegacyQueryResultHandler,
  downloadLegacyVisualizationHandler,
  getSampleQuestionsHandler,
  getSpaceInfoHandler,
} from "../controllers/chatController.js";

const router = Router();

router.post("/messages", sendMessage);
router.get("/sample-questions", getSampleQuestionsHandler);
router.get("/space-info", getSpaceInfoHandler);
router.get("/conversations", listConversationsHandler);
router.delete("/conversations/:conversationId", deleteConversationHandler);
router.get(
  "/conversations/:conversationId/messages",
  listConversationMessagesHandler,
);
router.get(
  "/conversations/:conversationId/messages/:messageId/attachments/:attachmentId/query-result",
  getLegacyQueryResultHandler,
);
router.get(
  "/conversations/:conversationId/messages/:messageId/attachments/:attachmentId/download-visualization",
  downloadLegacyVisualizationHandler,
);

export default router;
