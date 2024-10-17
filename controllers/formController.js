const Form = require('../models/formModel');
const Job = require('../models/jobModel');
const Service = require('../models/serviceModel');

// Get all forms
exports.getAllForms = async (req, res) => {
    // #swagger.tags = ['form']
    try {
        const forms = await Form.findAll();
        res.status(200).json(forms);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching forms', error: err.message });
    }
};

// Get a form by ID
exports.getFormById = async (req, res) => {
    // #swagger.tags = ['form']
    const { id } = req.params;

    try {
        const form = await Form.findByPk(id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        res.status(200).json(form);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching form', error: err.message });
    }
};

// Create a new form
exports.createForm = async (req, res) => {
    // #swagger.tags = ['form']
    const { cid, sid, data } = req.body;

    try {
        const newForm = await Form.create({
            cid,
            sid,
            data,
        });
        const service = await Service.findByPk(sid);
        const newJob = await Job.create({
            cid,
            sid,
            budget: service.price,
            currentbudget: service.price,
            status: 'Pending',
            formid: newForm.id
        });
        res.status(201).json({ message: 'Form created successfully', form: newForm });
    } catch (err) {
        res.status(500).json({ message: 'Error creating form', error: err.message });
    }
};

// Update an existing form
exports.updateForm = async (req, res) => {
    // #swagger.tags = ['form']
    const { id } = req.params;
    const { cid, sid, data } = req.body;

    try {
        const form = await Form.findByPk(id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        form.cid = cid || form.cid;
        form.sid = sid || form.sid;
        form.data = data || form.data;

        await form.save();
        res.status(200).json({ message: 'Form updated successfully', form });
    } catch (err) {
        res.status(500).json({ message: 'Error updating form', error: err.message });
    }
};

// Delete a form
exports.deleteForm = async (req, res) => {
    // #swagger.tags = ['form']
    const { id } = req.params;

    try {
        const form = await Form.findByPk(id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        await form.destroy();
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting form', error: err.message });
    }
};
