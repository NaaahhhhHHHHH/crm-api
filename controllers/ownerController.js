const Owner = require('../models/ownerModel');
const Employee = require('../models/employeeModel');
const Customer = require('../models/customerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Get all owners
exports.getAllOwners = async (req, res) => {
    // #swagger.tags = ['owner']
    try {
        const owners = await Owner.findAll({
            attributes: { exclude: ['password'] },
          });
        res.status(200).json(owners);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching owners', error: err.message });
    }
};

// Get an owner by ID
exports.getOwnerById = async (req, res) => {
    // #swagger.tags = ['owner']
    const { id } = req.params;

    try {
        const owner = await Owner.findByPk(id);

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        owner.password = "";
        res.status(200).json(owner);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching owner', error: err.message });
    }
};

// Create a new owner
exports.createOwner = async (req, res) => {
    // #swagger.tags = ['owner']
    const { username, password, name, mobile, work, email } = req.body;

    try {
        // Check if the username already exists
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newOwner = await Owner.create({
            username,
            password: hashedPassword,
            name,
            mobile,
            work,
            email
        });

        res.status(201).json({ message: 'Owner created successfully', owner: newOwner });
    } catch (err) {
        res.status(500).json({ message: 'Error creating owner', error: err.message });
    }
};

// Create default owner
exports.createDefaultOwner = async (req, res) => {
    // #swagger.tags = ['owner']
    //const { username, password, name, company } = req.body;
    const username = 'admin';
    const password = 'admin123';
    const name = 'Admin';
    const mobile = '0966785887';
    const email = 'admin@gmail.com';

    try {
        // Check if the username already exists
        const existingOwner = await Owner.findOne({ where: { username } });

        if (existingOwner) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newOwner = await Owner.create({
            username,
            password: hashedPassword,
            name,
            mobile,
            email
        });

        res.status(201).json({ message: 'Default owner created successfully', owner: newOwner });
    } catch (err) {
        res.status(500).json({ message: 'Error creating owner', error: err.message });
    }
};

// Update an existing owner
exports.updateOwner = async (req, res) => {
    // #swagger.tags = ['owner']
    const { id } = req.params;
    const { username, name, mobile, work, password, email } = req.body;

    try {
        const owner = await Owner.findByPk(id);

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const existingCustomerEmail = await Customer.findOne({
            where: {
                email,
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
                id: {
                    [Op.ne]: id,
                },
            }
        });
        const existingCustomerUser = await Customer.findOne({
            where: {
                username,
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
                id: {
                    [Op.ne]: id,
                },
            }
        });                     
        
        if (existingCustomerUser || existingEmployeeUser || existingOwnerUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingCustomerEmail || existingEmployeeEmail || existingOwnerEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Update the owner fields if provided, otherwise keep old values
        owner.username = username || owner.username;
        owner.name = name || owner.name;
        owner.mobile = mobile || owner.mobile;
        owner.work = work || owner.work;
        owner.email = email || owner.email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            owner.password = await bcrypt.hash(password, salt);
        }

        await owner.save();
        res.status(200).json({ message: 'Owner updated successfully', owner });
    } catch (err) {
        res.status(500).json({ message: 'Error updating owner', error: err.message });
    }
};

// Delete an owner
exports.deleteOwner = async (req, res) => {
    // #swagger.tags = ['owner']
    const { id } = req.params;

    try {
        const owner = await Owner.findByPk(id);

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        await owner.destroy();
        res.status(200).json({ message: 'Owner deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting owner', error: err.message });
    }
};
