const Job = require('../models/jobModel');
const Customer = require('../models/customerModel');
const Service = require('../models/serviceModel');
const Form = require('../models/formModel');
const Assignment = require('../models/assignmentModel');
const { Op } = require('sequelize');

// Get all jobs
exports.getAllJobs = async (req, res) => {
    // #swagger.tags = ['job']
    try {
        let jobs = await Job.findAll();
        if (req.user.role == "employee") {
            let assignList = await Assignment.findAll();
            assignList = assignList ? assignList : []
            assignList = assignList.filter(r => r.eid == req.user.id)
            let jobList = assignList.map(r => r.jid)
            jobs = jobs.filter(r => jobList.includes(r.id))
        }
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching jobs', error: err.message });
    }
};

// Get a job by ID
exports.getJobById = async (req, res) => {
    // #swagger.tags = ['job']
    const { id } = req.params;

    try {
        const job = await Job.findByPk(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching job', error: err.message });
    }
};

// Create a new job
exports.createJob = async (req, res) => {
    // #swagger.tags = ['job']
    const { cid, sid, status, formid, budget } = req.body;

    try {
        // // Validate startdate and enddate
        // if (new Date(enddate) < new Date(startdate)) {
        //     return res.status(400).json({ message: 'End date must be after the start date.' });
        // }

        // Check if Customer, Service, and Form exist
        const customerExists = await Customer.findByPk(cid);
        const serviceExists = await Service.findByPk(sid);
        const formExists = await Form.findByPk(formid);

        if (!customerExists) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        if (!serviceExists) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (!formExists) {
            return res.status(404).json({ message: 'Form not found' });
        }

        const newJob = await Job.create({
            cid,
            sid,
            status,
            formid,
            budget,
            currentbudget: budget
        });

        res.status(201).json({ message: 'Job created successfully', job: newJob });
    } catch (err) {
        res.status(500).json({ message: 'Error creating job', error: err.message });
    }
};

// Update an existing job
exports.updateJob = async (req, res) => {
    // #swagger.tags = ['job']
    const { id } = req.params;
    const { cid, sid, status, formid, budget } = req.body;

    try {
        const job = await Job.findByPk(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        let assignList = await Assignment.findAll();
        assignList = assignList ? assignList : []
        assignList = assignList.filter(r => r.jid == id)
        if (req.user.role == 'employee') {
            let selfAssign = assignList.find(r => r.eid == req.user.id)
            if (!selfAssign) {
                return res.status(403).json({ message: 'Permission denied' });
            }
        }
        job.currentbudget += budget - job.budget
        if (job.currentbudget < 0) {
            return res.status(404).json({ message: "Job 's budget is lower than the total assigned budget" });
        }

        // // Validate startdate and enddate
        // if (enddate && new Date(enddate) < new Date(startdate)) {
        //     return res.status(400).json({ message: 'End date must be after the start date.' });
        // }

        // Check if Customer, Service, and Form exist
        // if (cid) {
        //     const customerExists = await Customer.findByPk(cid);
        //     if (!customerExists) {
        //         return res.status(404).json({ message: 'Customer not found' });
        //     }
        // }
        // if (sid) {
        //     const serviceExists = await Service.findByPk(sid);
        //     if (!serviceExists) {
        //         return res.status(404).json({ message: 'Service not found' });
        //     }
        // }
        // if (formid) {
        //     const formExists = await Form.findByPk(formid);
        //     if (!formExists) {
        //         return res.status(404).json({ message: 'Form not found' });
        //     }
        // }

        job.cid = cid || job.cid;
        job.sid = sid || job.sid;
        job.status = status || job.status;
        job.formid = formid || job.formid;
        job.budget = budget || job.budget;
        // job.enddate = enddate || job.enddate;
        // job.additionalprice = additionalprice || job.additionalprice;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (err) {
        res.status(500).json({ message: 'Error updating job', error: err.message });
    }
};

// Delete a job
exports.deleteJob = async (req, res) => {
    // #swagger.tags = ['job']
    const { id } = req.params;

    try {
        const job = await Job.findByPk(id);
        if (req.user.role == 'employee') {
            let assignList = await Assignment.findAll();
            assignList = assignList ? assignList : []
            assignList = assignList.filter(r => r.jid == id)
            let selfAssign = assignList.find(r => r.eid == req.user.id)
            if (!selfAssign) {
                return res.status(403).json({ message: 'Permission denied' });
            }
        }

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await job.destroy();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting job', error: err.message });
    }
};

// get dashboard data
exports.getJobStatistic = async (req, res) => {
    // #swagger.tags = ['job']
    let { year } = req.params;
    year = parseInt(year)

    try {

        const jobs = await Job.findAll({
            where: {
                status: {
                    [Op.ne]: 'Pending',
                },
            }
        });
        const assigns = await Assignment.findAll({
            where: {
                assignby: null,
                status: 'Accepted'
            }
        });
        const customers = await Customer.findAll();
        let data = {
            user: {
                total: 0,
                totalLast: 0,
                percent: 0,
                month: [0,0,0,0,0,0,0,0,0,0,0,0]
            },
            income: {
                total: 0,
                totalLast: 0,
                percent: 0,
                month: [0,0,0,0,0,0,0,0,0,0,0,0]
            },
            salary: {
                total: 0,
                totalLast: 0,
                percent: 0,
                month: [0,0,0,0,0,0,0,0,0,0,0,0]
            },
            profit: {
                total: 0,
                totalLast: 0,
                percent: 0,
                month: [0,0,0,0,0,0,0,0,0,0,0,0]
            }
        }

        const startCurrent = new Date(`${year}-1-1`).getTime()
        const endCurrent = new Date(`${year+1}-1-1`).getTime()
        const startLast = new Date(`${year-1}-1-1`).getTime()
        const endLast = new Date(`${year}-1-1`).getTime()
        let listMonth = []

        jobs.forEach(j => {
            let dateJ = new Date(j.createdAt).getTime()
            let month = new Date(j.createdAt).getMonth()
            if (startCurrent <= dateJ && dateJ < endCurrent) {
                data.income.total += j.budget
                data.income.month[month-1] += j.budget
            } else if (startLast <= dateJ && dateJ < endLast) {
                data.income.totalLast += j.budget
            }
        })
        data.income.percent = data.income.totalLast ? (data.income.total - data.income.totalLast) / data.income.totalLast : 'last0'

        assigns.forEach(a => {
            let dateJ = new Date(a.createdAt).getTime()
            let month = new Date(a.createdAt).getMonth()
            if (startCurrent <= dateJ && dateJ < endCurrent) {
                data.salary.total += a.payment.budget
                data.salary.month[month-1] += a.payment.budget
            } else if (startLast <= dateJ && dateJ < endLast) {
                data.salary.totalLast += j.budget
            }
        })
        data.salary.percent = data.salary.totalLast ? (data.salary.total - data.salary.totalLast) / data.salary.totalLast : 'last0'

        data.profit.total = data.income.total - data.salary.total
        data.profit.totalLast = data.income.totalLast - data.salary.totalLast
        data.profit.percent = data.profit.totalLast ? (data.profit.total - data.profit.totalLast) / data.profit.totalLast : 'last0'
        data.profit.month.forEach((m,index) => {
            data.profit.month[index] += data.income.month[index] - data.salary.month[index]
        })

        customers.forEach(c => {
            let dateJ = new Date(c.createdAt).getTime()
            let month = new Date(c.createdAt).getMonth()
            if (startCurrent <= dateJ && dateJ < endCurrent) {
                data.user.total += 1
                data.user.month[month-1] += 1
            } else if (startLast <= dateJ && dateJ < endLast) {
                data.user.totalLast += 1
            }
        })
        data.user.percent = data.user.totalLast ? (data.user.total - data.user.totalLast) / data.user.totalLast : 'last0'

        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ message: 'Error get statistical table', error: err.message });
    }
};