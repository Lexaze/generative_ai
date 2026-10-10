import express from "express";
import requireAuth from "../../middleware/requireAuth.js";
import requireFrontendOrigin from "../../middleware/requireFrontendOrigin.js";
import {
  createChatController,
  createMessageController,
  getChatMessagesController,
  getChatsController,
} from "./controller/chat.controller.js";

const chatRouter = express.Router();

chatRouter.use(requireAuth);
chatRouter.get("/chats", getChatsController);
chatRouter.post("/chats", requireFrontendOrigin, createChatController);
chatRouter.get("/chats/:chatId/messages", getChatMessagesController);
chatRouter.post(
  "/chats/:chatId/messages",
  requireFrontendOrigin,
  createMessageController,
);

export default chatRouter;
