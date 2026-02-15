# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for lyrnios.ai.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "lyrnios-ai") and click **Create**

## Step 2: Enable Google OAuth API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google People API"
3. Click on it and click **Enable**

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "lyrnios.ai"
   - Add your email as support email
   - Add authorized domains if needed
   - Click **Save and Continue** through all steps

4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "lyrnios.ai Web Client"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:8000`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/auth/google/callback`
   - Click **Create**

5. **Copy your credentials**:
   - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Client Secret

## Step 4: Configure Backend Environment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   # Google Gemini API Keys
   API_KEYS=your_gemini_api_key_1,your_gemini_api_key_2

   # Google OAuth Credentials (from Step 3)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret

   # JWT Secret Key
   SECRET_KEY=your-secure-random-secret-key

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Database URL (SQLite by default)
   DATABASE_URL=sqlite:///./lyrnios_auth.db
   ```

4. Generate a secure secret key (optional but recommended):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Copy the output and use it as your `SECRET_KEY`

## Step 5: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 6: Run the Application

1. Start the backend server:
   ```bash
   cd backend
   make dev
   # or
   uvicorn app:app --reload --port 8000
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Step 7: Test Authentication

1. Click "Sign in with Google" on the landing page
2. You'll be redirected to Google's consent screen
3. Select your Google account and grant permissions
4. You should be redirected back to the app, now logged in
5. Your profile picture should appear in the top right corner

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" error:**
- Ensure `http://localhost:8000/auth/google/callback` is added to authorized redirect URIs in Google Cloud Console
- Check that the URIs match exactly (including http vs https, port numbers)

**"invalid_client" error:**
- Double-check your Client ID and Client Secret in `.env`
- Ensure there are no extra spaces or quotes in the `.env` file

**Database errors:**
- The database is created automatically on first run
- If you see issues, delete `lyrnios_auth.db` and restart the backend

**Token expired:**
- Tokens expire after 7 days by default
- Simply log out and log back in to get a new token

## Production Deployment

For production deployment, you'll need to:

1. Update OAuth credentials in Google Cloud Console:
   - Add your production URLs to authorized origins and redirect URIs
   - Example: `https://yourapp.com` and `https://yourapp.com/auth/google/callback`

2. Update environment variables:
   - Set `FRONTEND_URL` to your production URL
   - Use a strong, random `SECRET_KEY`
   - Consider using PostgreSQL instead of SQLite
   - Use a persistent session store like Redis

3. Verify your OAuth consent screen in Google Cloud Console

## Security Notes

- Never commit `.env` files to version control
- Keep your `SECRET_KEY` secure and random
- Use HTTPS in production
- Regularly rotate your JWT secret keys
- Review Google OAuth scopes to only request what you need
