const Owner = require('../models/ownerModel');
const Employee = require('../models/employeeModel');
const Customer = require('../models/customerModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login function for Employee, Owner, and Customer
exports.loginAdmin = async (req, res) => {
    // #swagger.tags = ['auth']
    const {
        username,
        password
    } = req.body; // role can be 'employee', 'owner'

    try {
        let user = null;
        let origin = req.header('origin');
        let userType = 'owner';
        user = await Owner.findOne({
            where: {
                username
            }
        });
        if (!user) {
            userType = 'employee';
            user = await Employee.findOne({
                where: {
                    username
                }
            });
        }
        // If user not found
        if (!user) {
            return res.status(400).json({
                message: `Username not found`,
            });
        }

        let verification = true;

        // Check if the password is valid
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = jwt.sign({
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: userType,
                verification: verification
            },
            process.env.JWT_SECRET, {
                expiresIn: '1h'
            }
        );

        // Respond with the token and user details
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: userType,
                verification: verification
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error while logging in',
            error: error.message
        });
    }
};

exports.loginCustomer = async (req, res) => {
    // #swagger.tags = ['auth']
    const {
        username,
        password
    } = req.body; // role can be customer'

    try {
        let user = null;
        let origin = req.header('origin');
        let userType = 'customer';
        user = await Customer.findOne({
            where: {
                username
            }
        });

        // If user not found
        if (!user) {
            return res.status(400).json({
                message: `Username not found`,
            });
        }

        let verification = true;
        if (userType == 'customer') {
            verification = user.verification
        }

        if (!verification) {
            return res.status(401).json({
                message: 'Please verify your email',
            });
        }

        // Check if the password is valid
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = jwt.sign({
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: userType,
                verification: verification
            },
            process.env.JWT_SECRET, {
                expiresIn: '1h'
            }
        );

        // Respond with the token and user details
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: userType,
                verification: verification
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error while logging in',
            error: error.message
        });
    }
};

exports.auth = async (req, res) => {
    // #swagger.tags = ['auth']
    try {
        if (req.user && req.user.id && req.user.role) {
            const id = req.user.id
            const role = req.user.role;
            let user = null;
            switch (role) {
                case 'employee':
                    user = await Employee.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                case 'owner':
                    user = await Owner.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                case 'customer':
                    user = await Customer.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                default:
                    return res.status(400).json({
                        message: 'Invalid role provided'
                    });
            }

            let verification = true;
            if (role == 'customer') {
                verification = user.verification
            }

            if (!verification) {
                return res.status(401).json({
                    message: 'Please verify your email',
                });
            }

            // Regenerate JWT token
            const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: verification
                },
                process.env.JWT_SECRET, {
                    expiresIn: '1h'
                }
            );

            return res.status(200).json({
                message: 'Valid token',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: verification
                },
            });

        } else {
            res.status(401).json({
                message: 'Invalid Token'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error while Authen',
            error: error.message
        });
    }
}


exports.verifyEmail = async (req, res) => {
    // #swagger.tags = ['auth']
    const {
        password
    } = req.body;
    try {
        if (req.user && req.user.id && req.user.role) {
            const id = req.user.id
            const role = req.user.role;

            switch (role) {
                case 'employee':
                    user = await Employee.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                case 'owner':
                    user = await Owner.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                case 'customer':
                    user = await Customer.findOne({
                        where: {
                            id
                        }
                    });
                    break;
                default:
                    return res.status(400).json({
                        message: 'Invalid role provided'
                    });
            }

            user.verification = true;
            user.save();

            // Regenerate JWT token
            const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: user.verification
                },
                process.env.JWT_SECRET, {
                    expiresIn: '1h'
                }
            );

            return res.status(200).json({
                message: 'Successfull change your password',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: user.verification
                },
            });

        } else {
            res.status(400).json({
                message: 'Your link has been expired'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error while change your password',
            error: error.message
        });
    }
}

exports.resetPassword = async (req, res) => {
    // #swagger.tags = ['auth']
    try {
        if (req.user && req.user.id && req.user.role) {
            const id = req.user.id
            const role = req.user.role;

            let user = await Customer.findOne({
                        where: {
                            id
                        }
                    });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.save()

            // const authHeader = req.headers['authorization'];
            // const oldToken = authHeader && authHeader.split(' ')[1];
            // jwt.

            // Regenerate JWT token
            const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: user.verification
                },
                process.env.JWT_SECRET, {
                    expiresIn: '1h'
                }
            );

            return res.status(200).json({
                message: 'Successfull verify email',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: role,
                    verification: user.verification
                },
            });

        } else {
            res.status(400).json({
                message: 'Your link has been expired'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error while verify your email',
            error: error.message
        });
    }
}

