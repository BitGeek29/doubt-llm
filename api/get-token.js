import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  try {
    // Load service account credentials from environment variable
    const credentials = JSON.parse(process.env.GCLOUD_SERVICE_ACCOUNT);

    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    res.status(200).json({ access_token: token.token });
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).json({ error: "Failed to generate access token" });
  }
}
