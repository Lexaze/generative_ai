# Backend

## Local setup

1. Create a MySQL database and copy `.env.example` to `.env`. Set the database
   credentials and `GEMINI_API_KEY`; keep `.env` private.
2. Run `db/schema.sql` against that database before starting the server. This
   creates the user, session, chat, and message tables.
3. Install dependencies with `npm install`, then run `npm run dev`.
4. Start the frontend at `http://localhost:5173`. Set `FRONTEND_ORIGIN` to its
   exact origin if it uses a different host or port. For a deployed frontend,
   set `FRONTEND_ORIGIN` to its HTTPS origin and set `VITE_API_URL` in the
   frontend build environment to the backend API base URL.

Authentication uses a random, server-revocable session token in an HttpOnly,
SameSite=Lax cookie. The token itself is not stored in the database; only its
SHA-256 hash is stored. Production cookies are marked Secure, so production
must use HTTPS.

## API

- `POST /api/auth/signup` — create an account and sign in.
- `POST /api/auth/login` — sign in.
- `POST /api/auth/logout` — revoke the current session.
- `GET /api/auth/me` — get the current account.
- `GET /api/chat/chats` / `POST /api/chat/chats` — list or start chats.
- `GET /api/chat/chats/:chatId/messages` — load a chat's messages.
- `POST /api/chat/chats/:chatId/messages` — send a message and receive a reply.

Chat and message endpoints require authentication and only return data owned by
the signed-in user. The original `conversations` table, if present, is left
untouched: its messages have no account owner, so they are not assigned to a new
account or exposed across users.
