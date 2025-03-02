// services/api.ts
const MELDRX_BASE_URL = import.meta.env.VITE_MELDRX_BASE_URL ?? "";
const SYSTEM_APP_CLIENT_SECRET = import.meta.env.VITE_SYSTEM_APP_CLIENT_SECRET ?? "";
const SYSTEM_APP_CLIENT_ID = import.meta.env.VITE_SYSTEM_APP_CLIENT_ID ?? "";

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}
  
  /**
   * Fetches an authentication token using client credentials.
   */
export const fetchAuthToken = async (): Promise<string> => {
    console.log(`${MELDRX_BASE_URL}/connect/token`)
    const response = await fetch(`${MELDRX_BASE_URL}/connect/token`, {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
        client_id: SYSTEM_APP_CLIENT_ID!,
        client_secret: SYSTEM_APP_CLIENT_SECRET!,
        grant_type: "client_credentials",
        scope: "meldrx-api patient/*.* cds"
    })
    });

    if (!response.ok) {
    throw new Error("Failed to fetch token");
    }

    const data: AuthResponse = await response.json();
    return data.access_token;
};
  
/**
 * Fetches the image using the provided image URL.
 * The image URL contains both the workspace and image IDs.
 */
export const fetchImage = async (imageUrl: string): Promise<string> => {
    const token = await fetchAuthToken();
    const response = await fetch(imageUrl, {
    headers: {
        Authorization: `Bearer ${token}`
    }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch image");   
    }

    // Convert the response into a Blob and then create a local URL.
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
  