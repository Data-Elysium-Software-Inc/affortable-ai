
# Data Elysium [affortable.ai](https://affortable.ai)  Setup Tutorial

This guide helps you set up the Data Elysium [affortable.ai](https://affortable.ai) application built on the Vercel Chatbot template. It covers installing necessary software, configuring environment variables, and running the app in development mode.

---

## 1. Prerequisites

Before you begin, ensure that your development environment is ready:

- **Node.js**: The application requires Node.js. If you haven't installed it yet, download it from [nodejs.org/en/download](https://nodejs.org/en/download).
- **pnpm**: We use pnpm as the package manager. Once Node.js is installed, install pnpm globally by running:

  ```bash
  npm install -g pnpm
  ```

---

## 2. Cloning the Repository

Your app is based on the Vercel Chatbot template. Start by cloning the base code from [GitHub](https://github.com/Data-Elysium-Software-Inc/affortable-ai):
```bash
git clone https://github.com/Data-Elysium-Software-Inc/affortable-ai.git
cd affortable-ai
```
*(If you have already forked or adapted the repository, navigate to your project folder.)*

---

## 3. Environment Variables

For security and configuration, the app uses a `.env` file. **Do not commit your `.env` file to version control.**  
Below is an example environment configuration that you can use as a starting point. Create a `.env` file in your project root and paste the content below:

```bash
# Authentication Secret
# Generate a random secret using https://generate-secret.vercel.app/32 or via: openssl rand -base64 32
AUTH_SECRET=

# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=

# Vercel Blob Store (Read & Write token)
# For instructions, see: https://vercel.com/docs/storage/vercel-blob
BLOB_READ_WRITE_TOKEN=

# Postgres Database URL
POSTGRES_URL=

# OpenAI API Key (Make sure to replace with your actual key)
OPENAI_API_KEY=

# Azure Configuration
AZURE_RESOURCE_NAME=
AZURE_API_KEY=
AZURE_DEPLOYMENT_NAME=
AZURE_API_VERSION=

# Optional: Azure O1 & O3 configurations
AZURE_RESOURCE_NAME_O=
AZURE_API_KEY_O=
AZURE_API_VERSION_O=

# Azure DeepSeek
AZURE_DEEPSEEK_API_KEY=
AZURE_DEEPSEEK_BASE_URL=

# Anthropic API Key
ANTHROPIC_API_KEY=

# SlideSpeak Key
SLIDE_SPEAK_KEY=

# Resume Maker URL endpoint
RESUME_MAKER_URL=

# AILABTOOL API Keys and URLs
AILABTOOL_API_KEY=
AILABTOOL_ANIMEFY_API_URL=
AILABTOOL_CLOTHIFY_API_URL=
AILABTOOL_API_STATUS_CHECK_URL=

# RapidAPI Key
RAPIDAPI_KEY=

# Rephrasy API Key and URL
REPHRASY_API_KEY=
REPHRASY_BASE_URL=

# Magic Hour API settings for Cloth Swap
MAGIC_HOUR_API_KEY=
MAGIC_HOUR_CLOTH_SWAP_API_URL=
MAGIC_HOUR_API_STATUS_CHECK_URL=

# Nodemailer SMTP (Email) Configuration
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# BKash Payment Gateway Credentials
BKASH_BASE_URL=
BKASH_CHECKOUT_URL_USER_NAME=
BKASH_CHECKOUT_URL_PASSWORD=
BKASH_CHECKOUT_URL_APP_KEY=
BKASH_CHECKOUT_URL_APP_SECRET=
```

> **Note:** Review each value and update as necessary for your production or development environments. Keep your sensitive keys secure.

> ⚠️ **You won’t need all the keys to run every feature.** Each tool or feature in the application only requires a subset of these keys. Configure only the ones necessary for what you're working on.


---

## 4. Installing And Running Affortable.ai

Inside your project directory, install the dependencies using pnpm:
```bash
pnpm install
```
This command will download and install all required libraries based on the `package.json` file.

---

## 5. Running the Application

To start the development server, run:
```bash
pnpm dev
```
Once the server starts, your app will be accessible at [http://localhost:3000](http://localhost:3000). You should see the chatbot interface running in your browser.


# How to Contribute to Affordable AI

**📺 To get started quickly, check out this video:**  [How to Contribute to Affordable AI](https://www.youtube.com/watch?v=j-1aF3Vvpys)

Follow these steps to contribute to the project:

1. **Visit the Repository**  
   Go to the [affortable-ai GitHub repository](https://github.com/Data-Elysium-Software-Inc/affortable-ai).  
   ![Figure 1](readme%20figures/fig1.png)

2. **Fork the Repository**  
   Click the **Fork** button on GitHub to create a personal copy of the repository.  
   ![Figure 2](readme%20figures/fig2.png)

3. **Confirm Fork Creation**  
   In the fork prompt, verify the details and click the **Fork** button to complete the process of forking the repository.  
   ![Figure 3](readme%20figures/fig3.png)

4. **Access Your Fork**  
   Once forking is complete, navigate to your forked repository.  
   ![Figure 3](readme%20figures/fig3.png)

5. **Sync Your Fork**  
   In your forked repository, click the **Sync Fork** button to update your copy with the latest changes from the original repository.  
   ![Figure 5](readme%20figures/fig5.png)

6. **Clone Your Repository**  
   Press the **Code** button to reveal the options for cloning your repository locally.  
   ![Figure 6](readme%20figures/fig6.png)

7. **Modify the Code**  
   Clone the repository to your local machine, then make the necessary modifications (e.g., add new features or debug).
   > ⚠️ **Follow the first section** for setting up the environment variables, installing the dependencies and then running the code in your local environment

8. **Commit and Push Changes**  
   After modifying the code, stage, commit, and push your changes back to your fork. Make sure you've set your remote origin to your fork and authenticated. Use the Git command line as follows:
   ```bash
   git add .
   git commit -m "Describe the changes you made"
   git push origin main
     ```

9. **Open a Pull Request**
In your forked repository on GitHub, click the Contribute button to start the pull request process to the Data-Elysium Affordable AI repository.
![Figure 7](readme%20figures/fig7.png)

10. **Provide Pull Request Details**
Fill in the pull request form with a clear commit title and detailed description, then click Create Pull Request.
![Figure 8](readme%20figures/fig8.png)

11. **Await Review**
Your pull request has been submitted. Now, wait for the Affordable AI team to review and merge your changes.
![Figure 9](readme%20figures/fig9.png)





# Affordable AI Documentation

## Overview
This repository contains a **Vercel AI SDK**–based chatbot application, designed to integrate multiple AI model providers seamlessly. It features:

- **Frontend**: Next.js (React) with [shadcn/ui]
- **Backend**: Next.js App Router (TypeScript)
- **Database**: PostgreSQL (via [Neon DB])
- **Deployment**: Vercel
- **AI Providers**: OpenAI, Anthropic, Google Vertex AI, DeepSeek, and more

## Tech Stack
- **Next.js** (App Router + React)
- **TypeScript** for type safety
- **Shadcn/ui** for ready-to-use React components
- **Drizzle ORM** (if used) or direct queries
- **PostgreSQL** hosted on Neon DB
- **Vercel** for seamless CI/CD and hosting

## File Structure
Below is the high-level structure with the most critical modules highlighted:

```
📦 app
 ┣ 📂 **(auth)**            # Authentication frontend & backend
 ┣ 📂 **(chat)**            # Chat UI & API logic
 ┃ ┗ 📂 api
 ┃   ┗ 📂 chat
 ┃     ┗ 📄 **route.ts**     # Entry point for all chatbot & AI model endpoints
 ┣ 📄 layout.tsx           # Frontend root ("use client" written here)

📦 components             # Shared UI components (client-side)
 ┣ 📄 **multimodal-input.tsx**  # Chat input handlers
 ┗ 📄 **message.tsx**           # Chat message UI

📦 lib
 ┣ 📂 ai
 ┃ ┣ 📄 **models.ts**      # Configuration for AI providers & model metadata
 ┃ ┗ 📄 **prompts.ts**     # Custom prompt templates per provider
 ┣ 📂 db
 ┃ ┣ 📄 **queries.ts**     # All database queries used by API
 ┃ ┗ 📄 **schema.ts**      # Database schema definitions / migrations
 ┣ 📄 index.ts             # Optional entrypoint for shared utilities
 ┗ 📄 custom-middleware.ts # (Optional) request logging, auth checks, etc.

📄 .env                    # Environment variables (DB URL, API keys, etc.)
```

> **Note**: Files/folders in **bold** are key to the chatbot’s core functionality.

 ![Figure 9](readme%20figures/file-structure.png)
 
 *This figure illustrates the file structures*

---

## Core Modules & Responsibilities

### `app/layout.tsx`
- The **frontend entry point** for all pages
- Includes a top-level `<Providers>` wrapper (e.g., for auth, theme)
- Marked with `"use client"` to enable client-side interactivity

### `app/(auth)`
- Contains both **frontend** (login/register forms) and **backend** (API routes) for authentication
- Integrates with NextAuth or custom JWT logic

### `app/(chat)/api/chat/route.ts`
- Implements the **API route** that handles all chat requests
- Routes incoming messages to the appropriate AI provider (OpenAI, Anthropic, etc.) based on request payload
- Uses `lib/ai/models.ts` and `lib/ai/prompts.ts` for provider-specific logic
- Reads/writes chat history or usage records via `lib/db/queries.ts`

### `components/multimodal-input.tsx`
- Renders the chat input box, file uploads (images, PDFs), and handles user events
- Sends typed or multimodal payloads to `/api/chat`

### `components/message.tsx`
- Renders each chat message with provider-specific styling or attachments
- Supports text, images, and rich responses

### `lib/ai/models.ts`
- Exports a list of supported AI providers and their model endpoints


### `lib/ai/prompts.ts`
- Centralizes prompt templates, system messages, and any preprocessing logic
- Enables easy A/B testing and prompt tweaking per provider

### `lib/db/queries.ts`
- Houses all SQL queries (via Drizzle ORM or raw SQL) for:
  - User profiles & sessions
  - Chat history & logs
  - Billing / usage tracking

### `lib/db/schema.ts`
- Defines database tables and migrations
- Ensures consistent structure across development & production

### `.env`
Contains sensitive configuration:
```
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...
DEEPSEEK_API_KEY=...
...
```
---

## End‑to‑End Chat Flow

1. **User → Browser**  
   The user opens the chat UI in their browser and types a message.

2. **Browser → Backend**  
   The frontend (in `app/(chat)/api/chat/route.ts`) receives the user’s message via a `POST /api/chat` request, including the chosen model and user ID.

3. **Backend → AI Provider**  
   The backend selects the appropriate AI provider (e.g. GPT‑4, Gemini‑2.5) using `lib/ai/models.ts` and `lib/ai/prompts.ts`, then forwards the user message to that provider’s API.

4. **AI Provider → Backend**  
   The AI model processes the prompt and returns a generated reply to your backend.

5. **Cost Calculation & Balance Update**  
   Your backend computes the token-usage cost for the API call, deducts it from the user’s balance, and persists both the chat message and the updated balance via `lib/db/queries.ts`.

6. **Backend → Browser**  
   Finally, the backend responds to the frontend with the AI’s reply and the user’s new balance.

7. **Browser → User**  
   The chat UI renders the AI response and displays the updated balance to the user.

 ![Figure 9](readme%20figures/basic_call.png)
*This figure illustrates the basic call*

---

## Tool‑Call Chat Flow (with Zod Schema & Third‑Party API)

1. **User → Browser**  
   The user opens the chat UI and types a message.

2. **Browser → Backend**  
   The frontend sends a `POST /api/chat` to `app/(chat)/api/chat/route.ts` with `{ model: 'tool', message, userId }`.

3. **Prompt Preprocessing & Schema Attachment**  
   - The backend preprocesses the user’s message into a tool‑specific prompt.  
   - It attaches a Zod JSON schema describing the expected parameters for that tool call.

4. **Backend → AI Model**  
   Send the combined `{ prompt, schema }` payload to the AI model (e.g. GPT‑4 or Gemini‑2.5).

5. **AI Model → Backend**  
   The model parses the schema and returns a JSON object matching the Zod parameter definition.

6. **Execute Tool Function**  
   - The backend invokes `executeTool(parsedParams)`.  
   - Inside `executeTool`, a third‑party API is called using those parameters.

7. **Third‑Party API → Backend**  
   Receive the API’s custom response (data, status, etc.).

8. **Cost Calculation & Persistence**  
   Compute any usage cost, deduct from the user’s balance, and save both the chat record and updated balance via `lib/db/queries.ts`.

9. **Backend → Browser**  
   Return the third‑party API’s custom response payload to the frontend.

10. **Browser → User**  
    The chat UI’s `message.tsx` component renders the custom response for the user to see.

![Figure 9](readme%20figures/tool_call.png)
*This figure illustrates the tool call*

---

## Authentication & Registration

### Login Options
- **Google**: Users can log in using their Google account.  
- **Email/Password**: Users can also log in using a traditional email and password combination.

### Registration Process
- **Email Registration**:
  1. Users registering via email must first verify their address by entering a one‑time password (OTP) sent to their email.  
  2. After successful OTP verification, users proceed to set a new password.  
  3. A referral code can optionally be provided during registration.  
- **Google Registration**:
  - Users registering with Google follow the OAuth flow provided by NextAuth.

### Password Reset
1. If a user forgets their password, they can initiate a password reset.  
2. An OTP is sent to the user’s email for verification.  
3. Once verified, the user is allowed to set a new password.

### Authentication Method
The system uses a JWT‑based authentication mechanism provided by NextAuth to manage secure user sessions.

**Figure : Basic authentication flow**

![Basic Auth Flow](readme%20figures/basic.png)
*This figure illustrates the core jwt based login steps*

---

**Figure : Full authentication flow**

![Full Auth Flow](readme%20figures/full.png)
*This figure illustrates the full login and registration process in affortable-ai*