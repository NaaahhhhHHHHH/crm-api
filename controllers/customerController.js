const Customer = require('../models/customerModel');
const Employee = require('../models/employeeModel');
const Owner = require('../models/ownerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Get all customers
exports.getCustomers = async (req, res) => {
    // #swagger.tags = ['customer']
    try {
        const customers = await Customer.findAll({
            attributes: { exclude: ['password'] },
          });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
};

// Fetch a specific customer's details by ID
exports.getCustomerById = async (req, res) => {
    // #swagger.tags = ['customer']
    const { id } = req.params;

    try {
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        customer.password=""
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching Customer', error: err.message });
    }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
    // #swagger.tags = ['customer']
    const { name, username, password, email, mobile, work, verification } = req.body;

    try {
                   
        const existingCustomerEmail = await Customer.findOne({ where: { email } });
        const existingEmployeeEmail = await Employee.findOne({ where: { email } });
        const existingOwnerEmail = await Owner.findOne({ where: { email } });

        const existingCustomerUser = await Customer.findOne({ where: { username } });
        const existingEmployeeUser = await Employee.findOne({ where: { username } });
        const existingOwnerUser = await Owner.findOne({ where: { username } });

        if (existingCustomerUser || existingEmployeeUser || existingOwnerUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingCustomerEmail || existingEmployeeEmail || existingOwnerEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newCustomer = await Customer.create({
            name,
            username,
            password,
            email,
            mobile,
            work,
            verification
            // ssn,
            // service,
            // card,
            // cvv,
            // exp,
        });

        res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
    } catch (err) {
        res.status(500).json({ message: 'Error creating customer', error: err.message });
    }
};

// Create a new customer
exports.registerCustomer = async (req, res) => {
    // #swagger.tags = ['customer']
    const { name, username, password, email, mobile, work } = req.body;

    try {
                   
        const existingCustomerEmail = await Customer.findOne({ where: { email } });
        const existingEmployeeEmail = await Employee.findOne({ where: { email } });
        const existingOwnerEmail = await Owner.findOne({ where: { email } });

        const existingCustomerUser = await Customer.findOne({ where: { username } });
        const existingEmployeeUser = await Employee.findOne({ where: { username } });
        const existingOwnerUser = await Owner.findOne({ where: { username } });

        if (existingCustomerUser || existingEmployeeUser || existingOwnerUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingCustomerEmail || existingEmployeeEmail || existingOwnerEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newCustomer = await Customer.create({
            name,
            username,
            password,
            email,
            mobile,
            work,
            verification: false
            // ssn,
            // service,
            // card,
            // cvv,
            // exp,
        });

        res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
    } catch (err) {
        res.status(500).json({ message: 'Error creating customer', error: err.message });
    }
};

// Update customer information
exports.updateCustomer = async (req, res) => {
    // #swagger.tags = ['customer']
    const { id } = req.params;
    const { name, username, password, email, mobile, work, verification } = req.body;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const existingCustomerEmail = await Customer.findOne({
            where: {
                email,
                id: {
                    [Op.ne]: id,
                },
            }
        });
        const existingEmployeeEmail = await Employee.findOne({
            where: {
                email,
            }
        });
        const existingOwnerEmail = await Owner.findOne({
            where: {
                email,
            }
        });
        const existingCustomerUser = await Customer.findOne({
            where: {
                username,
                id: {
                    [Op.ne]: id,
                },
            }
        });
        const existingEmployeeUser = await Employee.findOne({
            where: {
                username,
            }
        });
        const existingOwnerUser = await Owner.findOne({
            where: {
                username,
            }
        });                 

        if (existingCustomerUser || existingEmployeeUser || existingOwnerUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingCustomerEmail || existingEmployeeEmail || existingOwnerEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // if (email && customer.email != email) {
        //     customer.verification = false;
        // }

        // Update customer fields
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.mobile = mobile || customer.mobile;
        customer.work = work || customer.work;
        customer.verification = verification;
        // customer.service = service || customer.service;

        // Encrypt and update sensitive fields if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            customer.password = await bcrypt.hash(password, salt);
        }
        // if (ssn) {
        //     const salt = await bcrypt.genSalt(10);
        //     customer.ssn = await bcrypt.hash(ssn, salt);
        // }
        // if (card) {
        //     const salt = await bcrypt.genSalt(10);
        //     customer.card = await bcrypt.hash(card, salt);
        // }
        // if (cvv) {
        //     customer.cvv = cvv;
        // }
        // if (exp) {
        //     customer.exp = exp;
        // }

        await customer.save();
        res.json({ message: 'Customer updated successfully', customer });
    } catch (err) {
        res.status(500).json({ message: 'Error updating customer', error: err.message });
    }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
    // #swagger.tags = ['customer']
    const { id } = req.params;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await customer.destroy();
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting customer', error: err.message });
    }
};
