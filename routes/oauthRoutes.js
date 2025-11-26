const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../models/customerModel.js');
const Employee = require('../models/employeeModel.js');
const Owner = require('../models/ownerModel.js');
const OAuthClient = require('../models/oauthClientModel.js');
const {authenticateToken, authorizeRole} = require('../middleware/authMiddleware');

const router = express.Router();

/* =======================================================================
   1. AUTHORIZE ? Shows the login page and validates the OAuth client
   (Part of the Authorization Code Flow)
======================================================================= */
router.get('/api/oauth/authorize', async (req, res) => {
    const { client_id, redirect_uri, state } = req.query;

    // Find client by client_id
    const client = await OAuthClient.findOne({ where: { client_id } });
    if (!client) return res.status(400).send('Invalid client');

    // Check if redirect_uri is allowed in this client
    if (!client.redirect_uris.includes(redirect_uri)) {
        return res.status(400).send('Invalid redirect URI');
    }

    // Check if this client supports the authorization_code grant
    if (!client.grant_types.includes("authorization_code")) {
        return res.status(400).send("Client does not support authorization_code");
    }

    // Render a simple login form
    res.send(`
      <h3>Login to continue</h3>
      <form method="POST" action="/api/oauth/login">
        <input type="hidden" name="client_id" value="${client_id}" />
        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
        <input type="hidden" name="state" value="${state}" />

        <input name="username" placeholder="Username" /><br>
        <input name="password" type="password" placeholder="Password" /><br>
        <button type="submit">Login</button>
      </form>
    `);
});

/* =======================================================================
   2. LOGIN ? Verifies the user and generates an Authorization Code (JWT)
======================================================================= */
router.post('/api/oauth/login', express.urlencoded({ extended: true }), async (req, res) => {
    const { username, password, client_id, redirect_uri, state } = req.body;

    // Verify the OAuth client
    const client = await OAuthClient.findOne({ where: { client_id } });
    if (!client) return res.status(400).send('Invalid client');

    if (!client.redirect_uris.includes(redirect_uri)) {
        return res.status(400).send('Invalid redirect URI');
    }

    // Find user in Owner, Employee, or Customer tables
    let user = await Owner.findOne({ where: { username } });
    let userType = 'owner';

    if (!user) {
        user = await Employee.findOne({ where: { username } });
        userType = 'employee';
    }

    if (!user) {
        user = await Customer.findOne({ where: { username } });
        userType = 'customer';
    }

    if (!user) return res.status(400).send('User not found');

    // Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send('Invalid credentials');

    // Email verification check for customers only
    if (userType === 'customer' && !user.verification) {
        return res.status(401).json({
            error: 'invalid_grant',
            message: 'Please verify your email',
        });
    }

    // Create the authorization code (JWT)
    const code = jwt.sign(
        {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: userType,
            client_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );

    // Redirect back to the client with the authorization code
    res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
});

/* =======================================================================
   3. TOKEN ? Exchanges the authorization code for access + refresh tokens
======================================================================= */
router.post('/api/oauth/token', express.urlencoded({ extended: true }), async (req, res) => {
    const { client_id, client_secret, code, grant_type } = req.body;

    // Find the OAuth client
    const client = await OAuthClient.findOne({ where: { client_id } });
    if (!client) return res.status(400).json({ error: 'invalid_client' });

    // Check if client supports the authorization_code grant
    if (!client.grant_types.includes("authorization_code")) {
        return res.status(400).json({ error: 'unauthorized_client' });
    }

    // Confidential clients must validate client_secret
    if (client.client_type === "confidential") {
        if (!client_secret || client.client_secret !== client_secret) {
            return res.status(400).json({ error: 'invalid_client' });
        }
    }

    // Only allow authorization_code flow
    if (grant_type !== "authorization_code") {
        return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    try {
        // Verify the authorization code (JWT)
        const user = jwt.verify(code, process.env.JWT_SECRET);

        // Generate Access Token
        const accessToken = jwt.sign(
            user,
            process.env.JWT_SECRET,
            { expiresIn: client.access_token_lifetime || 3600 }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: client.refresh_token_lifetime || 604800 }
        );

        return res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: client.access_token_lifetime || 3600
        });

    } catch (e) {
        return res.status(400).json({ error: 'invalid_grant' });
    }
});

/* ============================================================
   CREATE CLIENT  (POST /oauth/clients)
=========================================================== */
router.post("/api/oauth/clients", authenticateToken, authorizeRole(['owner', 'employee']), async (req, res) => {
    try {
        const {
            client_id,
            client_secret,
            client_name,
            redirect_uris,
            grant_types,
            scope,
            client_type,
            access_token_lifetime,
            refresh_token_lifetime
        } = req.body;

        // Create new client
        const client = await OAuthClient.create({
            client_id,
            client_secret,
            client_name,
            redirect_uris,
            grant_types,
            scope,
            client_type,
            access_token_lifetime,
            refresh_token_lifetime
        });

        res.json({
            message: "OAuth client created successfully",
            data: client
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ============================================================
   GET ALL CLIENTS  (GET /oauth/clients)
=========================================================== */
router.get("/api/oauth/clients", authenticateToken, authorizeRole(['owner', 'employee']), async (req, res) => {
    try {
        const clients = await OAuthClient.findAll();

        res.json({
            count: clients.length,
            data: clients
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   GET ONE CLIENT BY ID (GET /oauth/clients/:id)
=========================================================== */
router.get("/api/oauth/clients/:id", authenticateToken, authorizeRole(['owner', 'employee']), async (req, res) => {
    try {
        const client = await OAuthClient.findByPk(req.params.id);

        if (!client)
            return res.status(404).json({ error: "Client not found" });

        res.json(client);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ============================================================
   UPDATE CLIENT (PUT /oauth/clients/:id)
=========================================================== */
router.put("/api/oauth/clients/:id", authenticateToken, authorizeRole(['owner', 'employee']), async (req, res) => {
    try {
        const client = await OAuthClient.findByPk(req.params.id);

        if (!client)
            return res.status(404).json({ error: "Client not found" });

        await client.update(req.body);

        res.json({
            message: "Client updated successfully",
            data: client
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ============================================================
   DELETE CLIENT (DELETE /oauth/clients/:id)
=========================================================== */
router.delete("/api/oauth/clients/:id", authenticateToken, authorizeRole(['owner', 'employee']), async (req, res) => {
    try {
        const client = await OAuthClient.findByPk(req.params.id);

        if (!client)
            return res.status(404).json({ error: "Client not found" });

        await client.destroy();

        res.json({ message: "Client deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
