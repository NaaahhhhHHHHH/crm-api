const Assignment = require('../models/assignmentModel');
const Employee = require('../models/employeeModel');
const Service = require('../models/serviceModel');
const Job = require('../models/jobModel');

// Get all assignments
exports.getAllAssignments = async (req, res) => {
    // #swagger.tags = ['assignment']
    try {
        let assignments = await Assignment.findAll();
        if (req.user.role == 'employee') {
            let listAssign = assignments.filter(r => r.eid == req.user.id)
            let listJob = []
            listAssign.forEach(r => {
                listJob.push(r.jid)
            })
            assignments = assignments.filter(r => listJob.includes(r.jid))
        }
        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching assignments',
            error: err.message
        });
    }
};

// Get an assignment by ID
exports.getAssignmentById = async (req, res) => {
    // #swagger.tags = ['assignment']
    const {
        id
    } = req.params;

    try {
        const assignment = await Assignment.findByPk(id);

        if (!assignment) {
            return res.status(404).json({
                message: 'Assignment not found'
            });
        }

        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching assignment',
            error: err.message
        });
    }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
    // #swagger.tags = ['assignment']
    const {
        sid,
        payment,
        jid,
        reassignment,
        eid,
        status
    } = req.body;

    try {
        // Check if Service, Job, and Employee exist
        const serviceExists = await Service.findByPk(sid);
        const jobExists = await Job.findByPk(jid);
        const employeeExists = await Employee.findByPk(eid);

        const assignList = await Assignment.findAll();

        if (!serviceExists) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }
        if (!jobExists) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        if (!employeeExists) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        if (assignList.find(a =>
                a.jid == jid && a.eid == eid
            )) {
            return res.status(404).json({
                message: 'The employee already assigned to this job'
            });
        }

        if (req.user.role == 'employee') {
            const selfAssign = assignList.find(r => r.eid == req.user.id && jid == r.jid)
            if (!selfAssign || !selfAssign.reassignment) {
                return res.status(403).json({
                    message: 'Permission denied'
                });
            }
            if (payment.budget > selfAssign.payment.currentbudget) {
                return res.status(404).json({
                    message: 'Total budget limit exceeded maximum'
                });
            }
            selfAssign.payment.currentbudget -= payment.budget
            selfAssign.changed("payment", true)
            await selfAssign.save()
            if (jobExists.status == 'Pending') {
                jobExists.status = 'Preparing'
                await jobExists.save()
            }
        }
        if (req.user.role == 'owner') {
            if (payment.budget > jobExists.currentbudget) {
                return res.status(404).json({
                    message: 'Total budget limit exceeded maximum'
                });
            }
            payment.currentbudget = payment.budget
            jobExists.currentbudget -= payment.budget
            if (jobExists.status == 'Pending') {
                jobExists.status = 'Preparing'
            }
            await jobExists.save()
        }
        // Validate pay1 and pay2
        // if (pay1 < 0 || pay1 > 100) {
        //     return res.status(400).json({ message: 'Percentage pay (pay1) must be between 0 and 100' });
        // }
        // if (pay2 < 0) {
        //     return res.status(400).json({ message: 'Fixed pay (pay2) must be a non-negative number' });
        // }

        const newAssignment = await Assignment.create({
            sid,
            payment,
            jid,
            reassignment,
            eid,
            status,
            assignby: req.user.role == 'employee' ? req.user.id : null
        });

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment: newAssignment
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error creating assignment',
            error: err.message
        });
    }
};

// Update an existing assignment
exports.updateAssignment = async (req, res) => {
    // #swagger.tags = ['assignment']
    const {
        id
    } = req.params;
    const {
        sid,
        payment,
        jid,
        reassignment,
        eid,
        status
    } = req.body;

    try {
        const assignment = await Assignment.findByPk(id);

        if (!assignment) {
            return res.status(404).json({
                message: 'Assignment not found'
            });
        }

        // Check if Service, Job, and Employee exist
        if (sid) {
            const serviceExists = await Service.findByPk(sid);
            if (!serviceExists) {
                return res.status(404).json({
                    message: 'Service not found'
                });
            }
        }
        if (jid) {
            const jobExists = await Job.findByPk(jid);
            if (!jobExists) {
                return res.status(404).json({
                    message: 'Job not found'
                });
            }
        }

        if (eid) {
            const employeeExists = await Employee.findByPk(eid);
            if (!employeeExists) {
                return res.status(404).json({
                    message: 'Employee not found'
                });
            }
        }

        if (req.user.role == 'employee') {
            if (assignment.eid != req.user.id && assignment.assignby != req.user.id) {
                return res.status(403).json({
                    message: 'Permission denied'
                });
            }
        }

        if (eid && eid != assignment.eid && !assignment.assignby) {
            let assignChilds = await Assignment.findAll({
                where: {
                    assignby: assignment.eid,
                    jid: assignment.jid
                }
            })
            for (let assign of assignChilds) {
                assign.assignby = eid
                assign.save()
            }
        }

        if (payment) {
            payment.currentbudget = assignment.payment.currentbudget + payment.budget - assignment.payment.budget
            if (!assignment.assignby) {
                let job = await Job.findByPk(assignment.jid);
                if (payment.currentbudget < 0) {
                    return res.status(404).json({
                        message: "This budget is lower than the total children assigned budget"
                    })
                }
                job.currentbudget += assignment.payment.budget - payment.budget
                if (job.currentbudget < 0) {
                    return res.status(404).json({
                        message: 'Total budget limit exceeded maximum'
                    })
                }
                await job.save()
            } else {
                let parrentAssign = await Assignment.findOne({
                    where: {
                        eid: assignment.assignby,
                        jid: assignment.jid
                    }
                })
                if (parrentAssign) {
                    parrentAssign.payment.currentbudget += assignment.payment.budget - payment.budget
                    if (parrentAssign.payment.currentbudget < 0) {
                        return res.status(404).json({
                            message: 'Total budget limit exceeded maximum'
                        })
                    }
                    parrentAssign.changed("payment", true)
                    await parrentAssign.save()
                }
            }
        }

        // Validate pay1 and pay2
        // if (pay1 < 0 || pay1 > 100) {
        //     return res.status(400).json({ message: 'Percentage pay (pay1) must be between 0 and 100' });
        // }
        // if (pay2 < 0) {
        //     return res.status(400).json({ message: 'Fixed pay (pay2) must be a non-negative number' });
        // }

        assignment.sid = sid || assignment.sid;
        // assignment.pay1 = (pay1 || pay1 === 0) ? pay1 : assignment.pay1;
        // assignment.pay2 = (pay2 || pay2 === 0) ? pay2 : assignment.pay2;
        assignment.payment = payment || assignment.payment;
        assignment.jid = jid || assignment.jid;
        assignment.reassignment = (reassignment || reassignment === false) ? reassignment : assignment.reassignment;
        assignment.eid = eid || assignment.eid;
        assignment.status = status || assignment.status;

        await assignment.save();
        res.status(200).json({
            message: 'Assignment updated successfully',
            assignment
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error updating assignment',
            error: err.message
        });
    }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
    // #swagger.tags = ['assignment']
    const {
        id
    } = req.params;

    try {
        const assignment = await Assignment.findByPk(id);

        if (!assignment) {
            return res.status(404).json({
                message: 'Assignment not found'
            });
        }

        if (req.user.role == 'employee') {
            if (assignment.eid != req.user.id && assignment.assignby != req.user.id) {
                return res.status(403).json({
                    message: 'Permission denied'
                });
            }
        }
        
        if (!assignment.assignby) {
            let job = await Job.findByPk(assignment.jid)
            job.currentbudget += assignment.payment.budget
            await Assignment.destroy({
                where: {
                    assignby: assignment.eid,
                    jid: assignment.jid
                }
            })
            await assignment.destroy();
            await job.save()
        } else {
            let parrentAssign = await Assignment.findOne({
                where: {
                    eid: assignment.assignby,
                    jid: assignment.jid
                }
            })
            if (parrentAssign) {
                parrentAssign.payment.currentbudget += assignment.payment.budget
                parrentAssign.changed("payment", true)
                await parrentAssign.save()
            }
            await assignment.destroy();
        }
        res.status(200).json({
            message: 'Assignment deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting assignment',
            error: err.message
        });
    }
};
