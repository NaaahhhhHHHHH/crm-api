const express = require('express');
const Customer = require('../models/customerModel.js');
const Employee = require('../models/employeeModel.js');
const Owner = require('../models/ownerModel.js');
const { loadClients } = require('../config/clients.js');
const router = express.Router();

router.get('/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, state } = req.query;
    const clients = loadClients();
    const client = clients.find(c => c.client_id === client_id && c.redirect_uri === redirect_uri);
    if (!client) return res.status(400).send('Invalid client or redirect URI');

    res.send(`
      <h3>Login to continue</h3>
      <form method="POST" action="/oauth/login">
        <input type="hidden" name="client_id" value="${client_id}" />
        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
        <input type="hidden" name="state" value="${state}" />
        <input name="username" placeholder="Username" /><br>
        <input name="password" type="password" placeholder="Password" /><br>
        <button type="submit">Login</button>
      </form>
    `);
});

router.post('/oauth/login', express.urlencoded({ extended: true }), async (req, res) => {
    const { username, password, client_id, redirect_uri, state } = req.body;
    const clients = loadClients();
    const client = clients.find(c => c.client_id === client_id && c.redirect_uri === redirect_uri);
    if (!client) return res.status(400).send('Invalid client');

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

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send('Invalid credentials');

    let verification = true;
    if (userType == 'customer') {
        verification = user.verification
    }

    if (!verification) {
        return res.status(401).json({
            error: 'invalid_grant',
            message: 'Please verify your email',
        });
    }

    const code = jwt.sign(
        {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: userType,
            verification: verification, 
            client_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );

    res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
});

router.post('/oauth/token', express.urlencoded({ extended: true }), (req, res) => {
    const { client_id, client_secret, code, grant_type } = req.body;
    const clients = loadClients();
    const client = clients.find(c => c.client_id === client_id && c.client_secret === client_secret);
    if (!client) return res.status(400).json({ error: 'invalid_client' });

    if (grant_type === 'authorization_code') {
        try {
            const user = jwt.verify(code, process.env.JWT_SECRET);
            const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.json({
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: 'Bearer',
                expires_in: 3600
            });
        } catch (e) {
            return res.status(400).json({ error: 'invalid_grant' });
        }
    }

    res.status(400).json({ error: 'unsupported_grant_type' });
});


module.exports = router;
