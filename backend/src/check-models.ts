import { GoogleAuth } from "google-auth-library";

async function testConnection() {
    // 1. Setup Auth using your JSON file
    const auth = new GoogleAuth({
        keyFile: "./service-account.json", // Your NEW file
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    const location = "us-central1"; // We test this region first
    const modelId = "gemini-1.5-flash-002"; // Updated from 001

    console.log(`🎯 Target: Project [${projectId}] @ [${location}]`);

    // 2. Construct the URL manually (Bypassing the AI SDKs)
    // This hits the "Publisher" endpoint directly.
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    console.log(`📡 Sending Raw Request...`);

    try {
        const res = await client.request({
            url,
            method: "POST",
            data: {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "Hello, are you online?" }],
                    },
                ],
            },
        });

        console.log("\n✅ SUCCESS! The API is working.");
        // @ts-ignore
        console.log("Response:", res.data.candidates[0].content.parts[0].text);
    } catch (err: any) {
        console.error("\n❌ FAILED.");
        console.error(`Status: ${err.response?.status}`);
        console.error(`Reason: ${JSON.stringify(err.response?.data, null, 2)}`);
    }
}

testConnection();
