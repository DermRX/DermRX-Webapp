import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import FHIR from "fhirclient";
import Client from "fhirclient/lib/Client";
import { AppContext } from "../context/AppContext";

export default function LoginCallback() {
  const navigate = useNavigate();
  const appContext = useContext(AppContext);

  useEffect(() => {
    FHIR.oauth2.ready()
      .then(async (client: Client) => {
        if (!appContext) return;

        // Save FHIR client & user data in context
        appContext.setFhirClient(client);
        if (client.patient.id) appContext.setPatientFhirId(client.patient.id);
        if (client.state.serverUrl) appContext.setFhirUrl(client.state.serverUrl);
        appContext.setAccessToken(client.state.tokenResponse?.access_token ?? "");
        appContext.setIdToken(client.state.tokenResponse?.id_token ?? "");

        // Redirect to home page
        navigate("/analysis");
      })
      .catch(console.error);
  }, [appContext, navigate]);

  return <div>Loading...</div>;
}
