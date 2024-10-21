// cronTasks.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const Assignment = require('../models/assignmentModel');
const Job = require('../models/jobModel');
const Form = require('../models/formModel');
const Ticket = require('../models/ticketModel');
const fs = require('fs');
const path = require('path');
exports.setupCronJobs = () => {
    // Schedule the task to every 1 hour
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const assignmentsToExpire = await Assignment.findAll({
                where: {
                    status: 'Waiting',
                },
            });

            for (const assignment of assignmentsToExpire) {
                const expireDays = assignment.expire || 3; // Default to 3 if not set
                const expirationDate = new Date(assignment.createdAt);
                expirationDate.setDate(expirationDate.getDate() + expireDays);

                // Check if the current date has passed the expiration date
                if (now >= expirationDate) {
                    // Update the status to "Expired"
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
                    // assignment.status = 'Expired';
                    // await assignment.save();
                    console.log(`Assignment ${assignment.id} expired`);
                }
            }

            const jobList = await Job.findAll({
                where: {
                    status: 'Preparing',
                },
            });
            //console.log(jobList.toString());
            for (let j of jobList) {
                const assignmentsNotWait = await Assignment.findAll({
                    where: {
                        status: 'Waiting',
                        jid: j.id,
                    },
                });
                //console.log(assignmentsNotWait.toString());
                if (!assignmentsNotWait || !assignmentsNotWait.length) {
                    j.status = 'Running'
                    await j.save()
                    console.log(`Updated job ${j.id} to 'Running'`);
                }
            }
            console.log('Checked and updated assignments and jobs successfully.');
        } catch (error) {
            console.error('Error updating assignments and jobs:', error);
        }
    });

    cron.schedule('0 0 * * *', async () => {
        try {
            const uploadDir = path.join(__dirname, '../uploads');
            const files = fs.readdirSync(uploadDir); // Read all files in the uploads directory

            let validFileNames = []
            const listForm = await Form.findAll();
            for (let form of listForm) {
                let formData = form.data.filter( f => f.type == "file")
                formData.forEach(f => {
                    if (f && f.value && f.value.fileList && f.value.fileList.length) {
                        f.value.fileList.forEach( n => {
                            validFileNames.push(n.storagename)
                        })
                    }
                })
            }

            const listTicket = await Ticket.findAll();
            for (let ticket of listTicket) {
                let ticketData = ticket.data.filter( f => f.attachment)
                ticketData.forEach(f => {
                    if (f && f.attachment && f.attachment.fileList && f.attachment.fileList.length) {
                        f.attachment.fileList.forEach( n => {
                            validFileNames.push(n.storagename)
                        })
                    }
                })
            }

            for (const file of files) {
                if (!validFileNames.includes(file)) {
                    const filePath = path.join(uploadDir, file);
                    fs.unlinkSync(filePath); // Delete the file if not in the database
                    console.log(`Deleted file: ${file}`);
                }
            }
            
            console.log('File check and cleanup completed.');
        } catch (error) {
            console.error('Error delete file:', error);
        }
    })
};

