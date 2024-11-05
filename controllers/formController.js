const Form = require('../models/formModel');
const Job = require('../models/jobModel');
const Assignment = require('../models/assignmentModel');
const Service = require('../models/serviceModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //const { cid } = req.body;
        const uploadDir = path.join(__dirname, '../uploads', 1);
        fs.mkdirSync(uploadDir, { recursive: true }); // Ensure directory exists
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Add timestamp to avoid overwriting files
    },
});

const upload = multer({ storage });

exports.uploadFile = async (req, res) => {
    // #swagger.tags = ['form']
    try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
    
        // The uploaded file details are now available in req.file
        res.status(200).json({ message: 'File uploaded successfully', file: req.file });
      } catch (err) {
        res.status(500).json({ message: 'Error saving file', error: err.message });
      }
};

// Get all forms
exports.getAllForms = async (req, res) => {
    // #swagger.tags = ['form']
    try {
        let forms = await Form.findAll();
        if (req.user.role == "customer") {
            forms = forms.filter(r => r.cid == req.user.id)
        }
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

        if (service.blueprint && service.blueprint.checked && service.blueprint.listE.length) {
            newJob.status = 'Preparing'
            for (let r of service.blueprint.listE) {
                let assignData = r
                assignData.jid = newJob.id
                assignData.sid = sid
                newJob.currentbudget -= r.payment.budget
                await Assignment.create(assignData)
            }
            await newJob.save()
        }

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
