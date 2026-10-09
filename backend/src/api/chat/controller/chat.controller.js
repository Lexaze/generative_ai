import {
  createConversationService,
  getRecentConversationRows,
} from "../service/chat.service.js";

export async function createConversationController(req, res, next) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const result = await createConversationService(question);

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationController(req, res, next) {
  try {
    const result = await getRecentConversationRows(100);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
