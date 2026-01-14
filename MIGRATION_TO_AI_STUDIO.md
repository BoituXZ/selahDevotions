# Migration from Vertex AI to Google AI Studio

## ✅ Completed Changes

The following code changes have been successfully implemented:

### 1. **Environment Configuration** ([env.ts](backend/src/lib/env.ts))

-   ✅ Removed `GOOGLE_CLOUD_PROJECT`
-   ✅ Removed `GOOGLE_CLOUD_LOCATION`
-   ✅ Added `GEMINI_API_KEY` with validation

### 2. **AI Service** ([ai.ts](backend/src/services/ai.ts))

-   ✅ Updated `getClient()` to use Google AI Studio initialization
-   ✅ Removed `vertexai: true` config option
-   ✅ Removed `project` and `location` parameters
-   ✅ Added `apiKey: env.GEMINI_API_KEY` configuration
-   ✅ Updated logging messages to reference "Google AI Studio"

### 3. **Documentation**

-   ✅ Updated [CLAUDE.md](CLAUDE.md) with Google AI Studio references
-   ✅ Updated [.env.example](backend/.env.example) with new environment variables

## 🔧 Required Setup Steps

To complete the migration, you need to:

### Step 1: Get Your API Key

1. Visit **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Update Environment Variables

Update your `backend/.env` file:

```bash
# REMOVE these lines:
# GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
# GOOGLE_CLOUD_PROJECT="selah-prod"
# GOOGLE_CLOUD_LOCATION=global

# ADD this line:
GEMINI_API_KEY=your-actual-api-key-here
```

### Step 3: Remove Service Account File (Optional)

The service account file is no longer needed:

```bash
# You can safely remove:
rm backend/service-account.json
```

### Step 4: Test the Migration

```bash
cd backend
bun install  # Ensure dependencies are installed
bun run dev  # Start the server
```

Then test the chat endpoint:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you help me?"}'
```

## 📊 What Changed (Technical Summary)

| Aspect               | Before (Vertex AI)                                                                | After (Google AI Studio)                       |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Package**          | `@google/genai` v1.34.0                                                           | `@google/genai` v1.34.0 ✅ (same)              |
| **Authentication**   | Service account JSON file                                                         | API Key                                        |
| **Environment Vars** | `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS` | `GEMINI_API_KEY`                               |
| **Initialization**   | `new GoogleGenAI({ vertexai: true, project, location })`                          | `new GoogleGenAI({ apiKey })`                  |
| **API Methods**      | `client.models.generateContent(...)`                                              | `client.models.generateContent(...)` ✅ (same) |
| **Model**            | `gemini-2.0-flash-lite-001`                                                       | `gemini-2.0-flash-lite-001` ✅ (same)          |

## ✨ Benefits of Google AI Studio

-   **Simpler Setup**: Just an API key, no service account configuration
-   **Faster Development**: No GCP project setup required
-   **Same Functionality**: Identical API methods and models
-   **Same Quota Handling**: Existing error handling for 429 errors still works
-   **Free Tier Available**: Good for development and testing

## 🚀 Deployment Considerations

When deploying to production, ensure you:

1. **Set `GEMINI_API_KEY`** in your deployment environment (Cloud Run, Vercel, Railway, etc.)
2. **Remove old environment variables** (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS`)
3. **Monitor quotas** - Google AI Studio has different rate limits than Vertex AI
4. **Keep API key secure** - Never commit it to version control

## 📖 Additional Resources

-   Google AI Studio: https://aistudio.google.com/
-   API Documentation: https://ai.google.dev/gemini-api/docs
-   Get API Key: https://aistudio.google.com/app/apikey
-   Pricing: https://ai.google.dev/pricing

## ⚠️ Important Notes

-   The `@google/genai` package works with both Vertex AI and Google AI Studio
-   All API methods (`generateContent`, error handling, etc.) remain identical
-   Your existing chat logic, error handling, and rate limiting code is unchanged
-   The migration is fully backward compatible - you can switch back to Vertex AI by reverting the initialization code if needed

---

**Need help?** Check the [Google AI Studio documentation](https://ai.google.dev/gemini-api/docs/quickstart) or file an issue.
