# Project 2: Entra ID OIDC Group Access (Free-Tier Edition)

## Overview  
I will build a Node.js/Express web application secured by Entra ID OpenID Connect (OIDC). Access to the `/admin` endpoint will be restricted to members of the **WebApp-Admins** security group; members of **WebApp-Users** can sign in but cannot access `/admin`. Since our Entra ID tenant is on a free tier, we cannot assign groups to the enterprise app. Instead, we configure Entra ID to include **All groups** in the ID token, and our code will inspect the `groups` claim.

## Prerequisites  
- Node.js (v14 or higher) installed  
- An Entra ID tenant (free tier is fine) where you have Global Admin rights  
- A GitHub account  

## Setup (Entra ID)  

1. **Register an Entra ID application**  
   - Go to **Azure AD → App registrations → New registration**  
   - Name: `MyAzureApp`  
   - Redirect URI: `http://localhost:3000/auth/callback`  
   - Copy **Application (client) ID** and **Directory (tenant) ID**.

2. **Configure group claims “All groups”**  
   - Open **MyAzureApp → Token configuration**  
   - Delete any existing group claims.  
   - Click **+ Add group claim** → Under **Which groups**, select **All groups** → **Save**.

3. **Grant Microsoft Graph API permissions**  
   - In **MyAzureApp → API permissions**, add delegated:  
     - `User.Read`  
     - `GroupMember.Read.All`  
   - Click **Grant admin consent**.

4. **Create two Entra ID security groups**  
   - **Azure AD → Groups → + New group**  
     - Group 1: Name: `WebApp-Users` (Assigned; no assignment to the app)  
     - Group 2: Name: `WebApp-Admins` (Assigned; no assignment to the app)  
   - **Add members**:  
     - Add at least one user (yourself) to `WebApp-Users` only.  

5. **(Optional) Assign individual users to the app**  
   - If **Enterprise applications → MyAzureApp → Properties → User assignment required?** is **Yes**, assign each test user under **Users and groups**.  

6. **Capture screenshots** in `docs/screenshots/` (see file names in project structure).

## Files (to be created)  
- `authConfig.js` – Holds Entra ID Client ID, Tenant ID, Client Secret, Redirect URI, Group Object IDs  
- `src/middleware.js` – Checks `idTokenClaims.groups` to enforce “Users” vs. “Admins.”  
- `src/server.js` – Express server + MSAL code for login, callback, protected routes.

## How to Run (placeholder)
```bash
npm install
node src/server.js

Screenshots 

    docs/screenshots/1-registration.png

    docs/screenshots/2-token-config.png

    docs/screenshots/3-api-permissions.png

    docs/screenshots/4-create-groups.png

    docs/screenshots/5-webapp-users-members.png
