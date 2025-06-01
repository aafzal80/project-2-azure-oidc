// src/middleware.js

const { groupIds } = require("../authConfig");

/**
 * requiresAuth: Ensures the user is signed in (session has account info).
 * If not signed in, redirect to /login.
 */
function requiresAuth(req, res, next) {
  if (!req.session.account) {
    return res.redirect("/login");
  }
  next();
}

/**
 * requiresAdmin: Checks that the signed-in user belongs to the "WebApp-Admins" group.
 * If not, send a 403 Forbidden response.
 */
function requiresAdmin(req, res, next) {
  if (!req.session.account || !req.session.idTokenClaims) {
    return res.redirect("/login");
  }

  // `groups` claim is an array of GUIDs (object IDs of groups the user belongs to).
  const userGroups = req.session.idTokenClaims.groups || [];

  // If the userGroups array includes the Admin group GUID, proceed.
  if (userGroups.includes(groupIds.admins)) {
    return next();
  }

  // Otherwise, forbid access.
  return res.status(403).send("Forbidden: You do not have access to this resource.");
}

module.exports = {
  requiresAuth,
  requiresAdmin
};
