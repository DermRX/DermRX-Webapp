import { useEffect } from "react";
import FHIR from "fhirclient";

const MELDRX_CLIENT_ID = import.meta.env.VITE_MELDRX_CLIENT_ID ?? "";
const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "";

export default function Launch() {
  useEffect(() => {
    FHIR.oauth2.authorize({
      clientId: MELDRX_CLIENT_ID,
      scope: "launch openid fhirUser patient/*.read",
      redirectUri: `${APP_BASE_URL}/login-callback`,
      iss: new URLSearchParams(window.location.search).get("iss") || undefined
    });
  }, []);

  return <div>Launching...</div>;
}
