const Service = require('../models/serviceModel');

// Get all services
exports.getAllServices = async (req, res) => {
    // #swagger.tags = ['service']
    try {
        const services = await Service.findAll();
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching services', error: err.message });
    }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
    // #swagger.tags = ['service']
    const { id } = req.params;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json(service);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching service', error: err.message });
    }
};

// Create a new service
exports.createService = async (req, res) => {
    // #swagger.tags = ['service']
    const { name, price, description, formData } = req.body;

    try {
        // Check if the service with the same name already exists
        const existingService = await Service.findOne({ where: { name } });

        if (existingService) {
            return res.status(400).json({ message: 'Service with this name already exists' });
        }

        const newService = await Service.create({
            name,
            price,
            description,
            formData,
        });

        res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (err) {
        res.status(500).json({ message: 'Error creating service', error: err.message });
    }
};

// Update an existing service
exports.updateService = async (req, res) => {
    // #swagger.tags = ['service']
    const { id } = req.params;
    const { name, price, description, formData } = req.body;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Update the service fields if provided, otherwise keep old values
        service.name = name || service.name;
        service.price = price || service.price;
        service.description = description || service.description;
        service.formData = formData || service.formData;

        await service.save();
        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (err) {
        res.status(500).json({ message: 'Error updating service', error: err.message });
    }
};

// Delete a service
exports.deleteService = async (req, res) => {
    // #swagger.tags = ['service']
    const { id } = req.params;

    try {
        const service = await Service.findByPk(id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        await service.destroy();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting service', error: err.message });
    }
};
