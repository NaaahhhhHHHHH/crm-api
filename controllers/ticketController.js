const Ticket = require('../models/ticketModel');
const Customer = require('../models/customerModel');
const Service = require('../models/serviceModel');
const Form = require('../models/formModel');
const Job = require('../models/jobModel');  // Import Job model
const Assignment = require('../models/assignmentModel');
const { Op } = require('sequelize');

// Get all tickets
exports.getTickets = async (req, res) => {
    // #swagger.tags = ['ticket']
    try {
        let tickets = await Ticket.findAll();
        if (req.user.role == "employee") {
            let assignList = await Assignment.findAll();
            assignList = assignList ? assignList : []
            assignList = assignList.filter(r => r.eid == req.user.id)
            let jobList = assignList.map(r => r.jid)
            tickets = tickets.filter(r => jobList.includes(r.jid))
        }
        if (req.user.role == "customer") {
            tickets = tickets.filter(r => r.cid == req.user.id)
        }
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tickets', error: err.message });
    }
};

// Get a ticket by ID
exports.getTicketById = async (req, res) => {
    // #swagger.tags = ['ticket']
    const { id } = req.params;

    try {
        const ticket = await Ticket.findByPk(id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching ticket', error: err.message });
    }
};

// Create a new ticket
exports.createTicket = async (req, res) => {
    // #swagger.tags = ['ticket']
    const { cid, jid, sid, data, formid, status } = req.body;

    try {
        // Validate if necessary foreign keys exist
        const customer = await Customer.findByPk(cid);
        const job = await Job.findByPk(jid);
        const service = await Service.findByPk(sid);
        const form = await Form.findByPk(formid);

        if (!customer) {
            return res.status(400).json({ message: 'Customer not found' });
        }

        if (!job) {
            return res.status(400).json({ message: 'Job not found' });
        }

        if (!service) {
            return res.status(400).json({ message: 'Service not found' });
        }

        if (!form) {
            return res.status(400).json({ message: 'Form not found' });
        }

        if (job.status == 'Complete' ||  job.status == 'Maintain') {
            job.status = 'Running'
            job.save()
        }

        const newTicket = await Ticket.create({
            cid,
            jid,
            sid,
            data,
            formid,
            status: status || 'Pending'
        });

        res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
    } catch (err) {
        res.status(500).json({ message: 'Error creating ticket', error: err.message });
    }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
    // #swagger.tags = ['ticket']
    const { id } = req.params;
    const { cid, jid, sid, data, formid, status } = req.body;

    try {
        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Validate if necessary foreign keys exist
        const customer = cid ? await Customer.findByPk(cid) : null;
        const job = jid ? await Job.findByPk(jid) : null;
        const service = sid ? await Service.findByPk(sid) : null;
        const form = formid ? await Form.findByPk(formid) : null;

        if (cid && !customer) {
            return res.status(400).json({ message: 'Customer not found' });
        }

        if (jid && !job) {
            return res.status(400).json({ message: 'Job not found' });
        }

        if (sid && !service) {
            return res.status(400).json({ message: 'Service not found' });
        }

        if (formid && !form) {
            return res.status(400).json({ message: 'Form not found' });
        }

        // Update the ticket fields
        ticket.cid = cid || ticket.cid;
        ticket.jid = jid || ticket.jid;   // Update Job reference
        ticket.sid = sid || ticket.sid;
        ticket.data = data || ticket.data;
        ticket.formid = formid || ticket.formid;
        ticket.status = status || ticket.status;

        await ticket.save();
        res.json({ message: 'Ticket updated successfully', ticket });
    } catch (err) {
        res.status(500).json({ message: 'Error updating ticket', error: err.message });
    }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
    // #swagger.tags = ['ticket']
    const { id } = req.params;

    try {
        const ticket = await Ticket.findByPk(id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await ticket.destroy();
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting ticket', error: err.message });
    }
};
