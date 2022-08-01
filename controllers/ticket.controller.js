const User = require('../models/user.model')
const Ticket = require('../models/ticket.model')
const constants = require("../utils/constants")

exports.createTicket = async (req,res)=>{
    try{
        const ticketObj = {
            title : req.body.title,
            ticketPriority : req.body.ticketPriority,
            description : req.body.description,
            status : req.body.status,
            reporter : req.user.userId
        }
    
        const engineerarray = req.availableEngineers

        const engineer = engineerarray.sort((a,b)=>a.openTicketsAssigned.length - b.openTicketsAssigned.length)[0]

    
        if(engineer){
            ticketObj.assignee = engineer.userId
        }

        const ticketCreated = await Ticket.create(ticketObj);
        if(ticketCreated){
            const customer = req.user;

            customer.ticketsCreated.push(ticketCreated._id);
            customer.openTicketsCreated.push(ticketCreated._id);
            await customer.save();

            if(engineer){
                engineer.ticketsAssigned.push(ticketCreated._id);
                engineer.openTicketsAssigned.push(ticketCreated._id);
                await engineer.save()
            }
            console.log(`#### New ticket '${ticketCreated.title}' created by ${customer.name} ####`);
            res.status(201).send(ticketCreated)
        }


    }catch(err){
        console.log("#### Error while creating new ticket #### ", err);
        res.status(500).send({
            message : "Internal server error while creating new ticket"
        })
    }
}


exports.getAllTickets = async (req,res)=>{
    try{
        const queryObj = {}
    
        if(req.user.userType == constants.userType.customer){
    
            if(!req.user.ticketsCreated){
                return res.status(200).send({
                    message : "No tickets created by the user yet"
                });
            }

            if(req.query.status == constants.ticketStatus.open){
                queryObj["_id"] = {$in : req.user.openTicketsCreated};

            } else if(req.query.status == constants.ticketStatus.closed){
                queryObj["_id"] = {$in : req.user.closedTicketsCreated};

            } else{
                queryObj["_id"] = {$in : req.user.ticketsCreated};
            }


        }else if(req.user.userType == constants.userType.engineer){

            if(req.query.status == constants.ticketStatus.open){
                queryObj["$or"] = [{"_id" : {$in : req.user.openTicketsCreated}},{"_id" : {$in : req.user.openTicketsAssigned}}]

            } else if(req.query.status == constants.ticketStatus.closed){
                queryObj["$or"] = [{"_id" : {$in : req.user.closedTicketsCreated}},{"_id" : {$in : req.user.closedTicketsAssigned}}]

            } else{
                queryObj["$or"] = [{"_id" : {$in : req.user.ticketsCreated}},{"_id" : {$in : req.user.ticketsAssigned}}]
            }


        }
    
        const tickets = await Ticket.find(queryObj);
    
        res.status(200).send(tickets);
    
    }catch(err){
        console.log("#### Error while getting tickets #### ", err.message);
        res.status(500).send({
            message : "Internal server error while getting tickets"
        })
    }
}

exports.updateTicket = async (req,res)=>{
    try{
        const ticket = req.ticket;
        const ticketReporter = await User.findOne({userId : ticket.reporter});
        const ticketAssignee = await User.findOne({userId : ticket.assignee});
    
        ticket.title = req.body.title != undefined? req.body.title : ticket.title;
        ticket.description = req.body.description != undefined? req.body.description : ticket.description;
        ticket.ticketPriority = req.body.ticketPriority != undefined? req.body.ticketPriority : ticket.ticketPriority;

        if (req.body.status != undefined && ticket.status != req.body.status){
           
            const currentTicketStatus = ticket.status;
            ticket.status = req.body.status;

            if (currentTicketStatus == constants.ticketStatus.open){

                ticketReporter.openTicketsCreated.remove(ticket._id);
                ticketReporter.closedTicketsCreated.push(ticket._id);

                ticketAssignee.openTicketsAssigned.remove(ticket._id);
                ticketAssignee.closedTicketsAssigned.push(ticket._id)

                await ticketReporter.save();
                await ticketAssignee.save();

            } else {

                ticketReporter.closedTicketsCreated.remove(ticket._id);
                ticketReporter.openTicketsCreated.push(ticket._id);

                ticketAssignee.closedTicketsAssigned.remove(ticket._id);
                ticketAssignee.openTicketsAssigned.push(ticket._id)

                await ticketReporter.save();
                await ticketAssignee.save();

            }
        }

        if (req.body.assignee != undefined && ticket.assignee != req.body.assignee){

            ticket.assignee = req.body.assignee;
            const newAssignee = req.newAssignee;

            ticketAssignee.ticketsAssigned.remove(ticket._id);
            newAssignee.ticketsAssigned.push(ticket._id);

            ticketAssignee.openTicketsAssigned.remove(ticket._id);
            newAssignee.openTicketsAssigned.push(ticket._id);

            await ticketAssignee.save();
            await newAssignee.save();

        }
    
        const updatedTicket = await ticket.save();
        res.status(200).send(updatedTicket);

    }catch(err){
        console.log("#### Error while updating ticket #### ", err);
        res.status(500).send({
            message : "Internal error while updating the ticket"
        })
    }
}