import db from "../../../../db/db_config.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

function getGeminiClient() {
  if (!geminiApiKey) {
    const error = new Error(
      "Gemini API key is missing. Set GEMINI_API_KEY in backend/.env and restart the backend.",
    );
    error.status = 500;
    throw error;
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
}

// Get recent conversation rows from DB
export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;
  const [rows] = await db.execute(
    `SELECT id, role, content, created_at FROM conversations ORDER BY id DESC LIMIT ${safeLimit}`,
  );

  return rows.reverse();
};

// Generate assistant answer from Gemini API
async function generateAssistantAnswer(historyRows, question) {
  const history = historyRows.map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  history.push({ role: "user", parts: [{ text: question }] });

  try {
    const response = await getGeminiClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: history,
    });

    return {
      text: response.text,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      const authError = new Error(
        "Gemini rejected the API key. Check that GEMINI_API_KEY in backend/.env is valid, Gemini API access is enabled for its project, and the backend has been restarted.",
      );
      authError.status = 502;
      throw authError;
    }

    throw error;
  }
}

// Get message by ID
const getMessageById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, created_at FROM conversations WHERE id = ?`,
    [id],
  );
  return rows[0];
};

// Create new conversation and get assistant answer from Gemini API
export async function createConversationService(question) {
  if (!question || !question.trim()) {
    const error = new Error("Question is required");
    error.status = 400;
    throw error;
  }

  const historyRows = await getRecentConversationRows(5);
  const { text, totalTokens } = await generateAssistantAnswer(
    historyRows,
    question,
  );

  const [userInsertResult] = await db.execute(
    `INSERT INTO conversations(content, role) VALUES(?, 'user')`,
    [question],
  );

  const [assistantInsertResult] = await db.execute(
    `INSERT INTO conversations(role, content, token_count) VALUES(?, ?, ?)`,
    ["assistant", text, totalTokens],
  );

  const userConversation = await getMessageById(userInsertResult.insertId);
  const assistantConversation = await getMessageById(
    assistantInsertResult.insertId,
  );

  return {
    userConversation,
    assistantConversation,
  };
}
