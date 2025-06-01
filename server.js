// src/app.js

// 1) Import required modules
const express = require("express");
const session = require("express-session");
const passport = require("passport");

// Use Passport-SAML v4 (scoped package)
const { Strategy: SamlStrategy } = require("@node-saml/passport-saml");

// 2) Load the SAML configuration from config/auth0.json
const samlConfig = require("../config/auth0.json");

// 3) Configure the Passport-SAML strategy
//    The constructor requires samlConfig and a verify callback.
//    The verify callback receives the SAML profile and calls done(null, userObj).
const saml = new SamlStrategy(samlConfig, (profile, done) => {
  // profile.nameID, profile.email, etc. come from SAML attributes mapped by Auth0
  const user = {
    id: profile.nameID,
    email: profile.email,
    firstName: profile.given_name,
    lastName: profile.family_name,
    // "groups" claim holds your Auth0 role names, e.g. ["App-Users"] or ["App-Admins"]
    groups: profile["https://schemas.myapp.com/claims/groups"] || []
  };
  return done(null, user);
});

passport.use(saml);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 4) Initialize Express and middleware
const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    // NOTE: In production, change this to a secure, random string
    secret: "CHANGE_ME",
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: false  // set to true if you switch to HTTPS locally
    }
  })
);
    // Optional: if you run into cookie issues, try setting sameSite: "none" and secure: false here.
    // cookie: { sameSite: "none", secure: false }


app.use(passport.initialize());
app.use(passport.session());

// 5) SAML metadata endpoint
//    Auth0 can call this to retrieve your SP metadata (especially the ACS and entityID).
app.get("/saml/metadata", (req, res) => {
  res.type("application/xml");
  // This method builds the metadata XML based on your samlConfig
  res.send(saml.generateServiceProviderMetadata());
});

// 6) Login route - initiates SAML authentication
app.get(
  "/login",
  (req, res, next) => {
    console.log("🔔 GET /login hit; redirecting to Auth0’s SAML endpoint");
    next();
  },
  passport.authenticate("saml", {
    // If SAML handshake fails, redirect back to "/"
    failureRedirect: "/",
    // This sets req.session.messages with the error, if you want to inspect
    failureMessage: true
  })
);

// 7) Assertion Consumer Service (ACS) - Auth0 posts SAMLResponse here
app.post(
  "/saml/consume",
  (req, res, next) => {
    console.log("🔔 Received POST on /saml/consume");
    next();
  },
  passport.authenticate("saml", {
    failureRedirect: "/",
    failureMessage: true
  }),
  (req, res) => {
    // This callback only runs if passport.authenticate succeeded
    console.log("✅ SAML authentication succeeded. User:", req.user);
    // Redirect to home ("/") so the browser stops re-submitting the form
    return res.redirect("/");
  }
);

// 8) Home route ("/")
//    - If not authenticated, show a link to log in.
//    - If authenticated, greet them and show a link to the Admin page.
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(`Hello ${req.user.firstName}! <a href="/admin">Admin area</a>`);
  }
  return res.send('<a href="/login">Log in with SAML</a>');
});

// 9) Admin route - only users with "App-Admins" group can access
app.get("/admin", (req, res) => {
  if (req.isAuthenticated() && req.user.groups.includes("App-Admins")) {
    return res.send("👑 Welcome to the Admin Area!");
  }
  return res.status(403).send("⛔ Forbidden");
});

// 10) Error handler (optional) - catches SAML validation errors
app.use((err, req, res, next) => {
  console.error("❌ Error in SAML processing:", err);
  res.redirect("/"); // or res.status(500).send("SAML error");
});

// 11) Start the server
const PORT = 8080;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
