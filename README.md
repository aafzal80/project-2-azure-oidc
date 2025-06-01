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

## Code & Test

### Prerequisites  
- Node.js (v14 or higher) installed  
- `authConfig.js` correctly configured (Client ID, Tenant ID, Client Secret, Redirect URI, Group IDs)  
- Azure AD app registration set to include “All groups” in the ID token  
- Two Azure AD security groups created:  
  - **WebApp-Users** (with your user as a member)  
  - **WebApp-Admins** (your user added later for admin testing)

### 1. Install Dependencies  
```bash
npm install

2. Verify authConfig.js

Ensure you have:

module.exports = {
  auth: {
    clientId: "YOUR_CLIENT_ID_HERE",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE",
    clientSecret: "YOUR_CLIENT_SECRET_HERE",
    redirectUri: "http://localhost:3000/auth/callback"
  },
  groupIds: {
    users: "WEBAPP_USERS_OBJECT_ID",
    admins: "WEBAPP_ADMINS_OBJECT_ID"
  }
};

3. Start the Server

npm start

The server listens on http://localhost:3000.
4. Test as a “WebApp-Users” Member (Expect 403 for /admin)

    Navigate to http://localhost:3000 → redirected to /login → Azure AD sign-in.

    Sign in with a user who is only in WebApp-Users.

    After sign-in, you land on /, which displays your username, Object ID, and group GUID(s).

    Click Go to Admin Page or visit http://localhost:3000/admin. You should see 403 Forbidden.

    Screenshot: docs/screenshots/5-forbidden.png.

5. Test as a “WebApp-Admins” Member (Expect Admin Page)

    In Azure AD, add your user to WebApp-Admins (Azure AD → Groups → WebApp-Admins → Members → + Add members).

    Sign out: http://localhost:3000/logout.

    Sign in again: http://localhost:3000/login.

    After sign-in, “Your Groups (GUIDs)” now shows both group GUIDs.

    Click Go to Admin Page or visit http://localhost:3000/admin. You should see the Admin Page.

    

Screenshots 

    docs/screenshots/1-registration.png

    docs/screenshots/2-token-config.png

    docs/screenshots/3-api-permissions.png

    docs/screenshots/4-create-groups.png

    docs/screenshots/5-webapp-users-members.png

   docs/screenshots/6-forbidden.png

   docs/screenshots/7-admin-success.png

   docs/screenshots/8-success.png
