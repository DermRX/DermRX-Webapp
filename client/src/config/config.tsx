import IMeldRxLaunchData from "./IMeldRxLaunchData";

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "";
const MELDRX_CLIENT_ID = import.meta.env.VITE_MELDRX_CLIENT_ID ?? "";
const MELDRX_WORKSPACE_URL = import.meta.env.VITE_MELDRX_WORKSPACE_URL ?? "";

// Configure all the different workspaces you want to launch...
export const launchOption: IMeldRxLaunchData = {
    clientId: MELDRX_CLIENT_ID,
    workspaceUrl: MELDRX_WORKSPACE_URL,
    scope: "openid profile patient/*.read launch launch/patient",
    redirectUrl: `${APP_BASE_URL}/login-callback`,
};