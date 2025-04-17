
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
