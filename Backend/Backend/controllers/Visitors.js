const Visitors = require ("../models/Visitors");
const { Resend } = require('resend');
const QRCode = require('qrcode'); 

// Initialize Resend using the environment variable you just added
const resend = new Resend(process.env.RESEND_API_KEY);

exports.getVisitors = async (req, res) => {
    try {
        const visitors = await Visitors.find();
        res.status(200).json({success: true, data: visitors})
    }
    catch (error){
        res.status(400).json({success:false, error: error.message })
    }
}

exports.checkVisitor = async (req, res) => {
    try {
        const {mobileNo, dateOfVisit} = req.query;
        const visitors = await Visitors.find()
        .where("mobileNo")
        .equals(mobileNo)
        .where("dateOfVisit")
        .equals(dateOfVisit);
        if (visitors.length === 0){
            return res.status(400).json({Message: false, data: `Visitor is Not Found For The Above Date ${dateOfVisit} And mobileNo ${mobileNo} `})
        }
        res.status(200).json({success: true, data: visitors})
    }
    catch (error){
        res.status(400).json({Message: false, error: error.message })
    }
}

exports.getVisitorsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const visitors = await Visitors.find()
        .where("dateOfVisit")
        .gte(startDate) //Call from Front End
        .lte(endDate); //Call From Front End
        if (visitors.length === 0){
            return res.status(400).json({
                Message: false, 
                data: `Visitor Not Found For The Date Range Between ${startDate} And ${endDate}`})
        }
        res.status(200).json({success: true, data: visitors})
    }
    catch (error){
        res.status(400).json({Message: false, error: error.message })
    }
}

// Create Visitor - Approval Notice Codebase
exports.createVisitor = async (req, res) => {
    try {
        // 1. This saves the visitor to MongoDB with our default 'Pending Approval' status
        const visitors = await Visitors.create(req.body);
    
        // 2. This triggers the notification email to the HOST asking for approval
        try {
            // These links will point to our upcoming backend approval route processing logic
            // Note: If your local server uses port 3000 instead of 3000, change it here!
            const approveLink = `http://localhost:3000/VMS/version1/visitors/approve/${visitors._id}`;
            const rejectLink = `http://localhost:3000/VMS/version1/visitors/reject/${visitors._id}`;

            await resend.emails.send({
                from: 'onboarding@resend.dev', // Leave this as-is for testing
                to: 'adextoomuch@gmail.com', // ⚠️ Keeps sending to you so you can test clicking the buttons
                subject: `Action Required: Visit Request from ${visitors.visitorName}`,
                html: `
                    <h2>Hello Host,</h2>
                    <p>A visitor has requested an appointment to meet with you.</p>
                    <hr/>
                    <p><strong>Visitor Name:</strong> ${visitors.visitorName || 'N/A'}</p>
                    <p><strong>Scheduled Date:</strong> ${visitors.dateOfVisit || 'N/A'}</p>
                    <p><strong>Purpose of Visit:</strong> ${visitors.purpose || 'N/A'}</p>
                    <p><strong>Mobile Number:</strong> ${visitors.mobileNo || 'N/A'}</p>
                    <p><strong>E-mail ID:</strong> ${visitors.email || 'N/A'}</p>
                    <p><strong>Whom To Meet:</strong> ${visitors.whomToMeet || 'N/A'}</p>
                    <hr/>
                    <h3>Do you authorize this visit?</h3>
                    <p>Clicking approve will automatically generate and email their access pass QR code.</p>
                    <br/>
                    <!-- Styling these links like clickable buttons inside the email body -->
                    <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-right: 15px; display: inline-block; font-weight: bold;">APPROVE VISIT</a>
                    
                    <a href="${rejectLink}" style="background-color: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">REJECT VISIT</a>
                `,
            });
            console.log("Approval request email successfully dispatched to the host.");
        } catch (emailError) {
            // If the email fails, we log it but don't crash the database save action
            console.error("Failed to send host notification email:", emailError.message);
        }

        // 3. This sends the response back to your client. Note that no QR code is returned yet!
        res.status(200).json({ 
            success: true, 
            message: "Registration received. Awaiting host approval before pass activation.",
            data: visitors 
        });

    } catch (error) {
        res.status(400).json({ Message: false, error: error.message });
    }
}


// Checking Approved / Unapproved Visitor 
// 5. IMPROVED ENDPOINT: Handle scanning the QR code for Check-in with strict validations
exports.scanCheckIn = async (req, res) => {
    try {
        const { qrDataString } = req.body;

        if (!qrDataString) {
            return res.status(400).json({ success: false, message: "No QR code data provided." });
        }

        // 1. Unpack the JSON text string
        let parsedData;
        try {
            parsedData = JSON.parse(qrDataString);
        } catch (parseError) {
            return res.status(400).json({ success: false, message: "Invalid QR code format." });
        }

        const { visitorId } = parsedData;

        if (!visitorId) {
            return res.status(400).json({ success: false, message: "Visitor ID missing from QR data." });
        }

        // 2. Find the visitor in MongoDB
        const visitor = await Visitors.findOne({ visitorId });

        if (!visitor) {
            return res.status(404).json({ success: false, message: "Access Denied: Invalid digital pass." });
        }

        // ==========================================
        // 🛡️ NEW SECURITY GUARDS FOR WORKFLOW STATES
        // ==========================================
        if (visitor.status === 'Pending Approval') {
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied: The entry pass for ${visitor.visitorName} is still awaiting host authorization.` 
            });
        }

        if (visitor.status === 'Rejected') {
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied: This visit application was explicitly rejected by the host.` 
            });
        }
        // ==========================================

        // 3. Block double check-ins strictly without updating timestamps
        if (visitor.status === 'Checked In') {
            return res.status(400).json({ 
                success: false, 
                message: `Access Denied: ${visitor.visitorName} is already clocked into the facility since ${visitor.checkInTime.toLocaleTimeString()}.` 
            });
        }

        // 4. Validate if the visit corresponds to today's date
        const today = new Date().setHours(0, 0, 0, 0);
        const scheduledDate = new Date(visitor.dateOfVisit).setHours(0, 0, 0, 0);

        if (today !== scheduledDate) {
            return res.status(400).json({ 
                success: false, 
                message: `Access Denied: This appointment is scheduled for ${new Date(visitor.dateOfVisit).toDateString()}, not today.` 
            });
        }

        // 5. Update database status and lock the original arrival timestamp
        visitor.status = 'Checked In';
        visitor.checkInTime = new Date();
        await visitor.save();

        // 6. Send structural response back
        res.status(200).json({
            success: true,
            message: `Access Granted! Welcome, ${visitor.visitorName}.`,
            data: visitor
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


//Approval / Rejection Logic
// 7. NEW ENDPOINT: Process the Host's Approval or Rejection decision
exports.processApproval = async (req, res) => {
    try {
        const { id } = req.params;
        // Determine whether they clicked the approve path or reject path based on the URL
        const isApproval = req.path.includes('approve');

        // Find the visitor document by its primary MongoDB Object _id
        const visitor = await Visitors.findById(id);

        if (!visitor) {
            return res.status(404).send('<h1>Error: Visitor profile record not found.</h1>');
        }

        // Prevent modifying records that have already moved past the registration gateway
        if (visitor.status !== 'Pending Approval') {
            return res.status(400).send(`<h1>Notice: This request has already been processed. Current Status: ${visitor.status}</h1>`);
        }

        if (isApproval) {
            // Action Case A: The visit is authorized! 
            visitor.status = 'Approved';
            await visitor.save();

            // 1. GENERATE THE MULTI-DATA QR CODE NOW (Moved from initial creation stage)
            const qrDataObj = {
                visitorId: visitor.visitorId || 'N/A',
                visitorName: visitor.visitorName || 'N/A',
                mobileNo: visitor.mobileNo || 'N/A',
                whomToMeet: visitor.whomToMeet || 'N/A',
                dateOfVisit: visitor.dateOfVisit || 'N/A',
                email: visitor.email || 'N/A'
            };
            const qrDataString = JSON.stringify(qrDataObj);
            const qrCodeDataUrl = await QRCode.toDataURL(qrDataString);

            // 2. DISPATCH DIGITAL QR ACCESS PASS TO THE VISITOR
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'adextoomuch@gmail.com', // ⚠️ Change to visitor.email in production
                    subject: 'Your Visitor Access Pass Is Approved!',
                    html: `
                        <h1>Congratulations ${visitor.visitorName},</h1>
                        <p>Your visit request to meet with <strong>${visitor.whomToMeet}</strong> has been approved by the host.</p>
                        <p><strong>Your Unique Visitor ID:</strong> ${visitor.visitorId}</p>
                        <p><strong>Mobile No </strong> ${visitor.mobileNo}</p>
                        <p><strong>Address:</strong> ${visitor.address}</p>
                        <p><strong>Purpose</strong> ${visitor.purpose}</p>
                        <p><strong>Date of Visit</strong> ${visitor.dateOfVisit}</p>
                        <br/>
                        <h3>Your Digital Entry Ticket QR Code:</h3>
                        <img src="${qrCodeDataUrl}" alt="Access Pass QR" width="200" height="200" />
                        <br/>
                        <p>Please present this Confirmation Slip With QR Code To The Receptionist Or Gate Scanner Upon arrival <strong>${visitor.dateOfVisit}. </strong>
                        <br/>
                        <h2>NOTE: No Slip, No Entry </h2> 
                      `
                });
                console.log(`QR Pass safely emailed to visitor: ${visitor.visitorId}`);
            } catch (visitorEmailError) {
                console.error("Failed to email QR pass directly to visitor:", visitorEmailError.message);
            }

            // Return clean HTML confirmation screen to the host's web browser tab
            return res.status(200).send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                    <h1 style="color: #22c55e;">✓ Visit Successfully Approved</h1>
                    <p>Visitor <strong>${visitor.visitorName}</strong> <h3> Has Been Notified And issued A Data Info With Access Pass QR Code.</h3></p>
                </div>
            `);

        } else {
            // Action Case B: The visit is declined by host
            visitor.status = 'Rejected';
            await visitor.save();

            // Optional: You could notify the visitor via email here that their appointment was canceled
            return res.status(200).send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                    <h1 style="color: #ef4444;">✕ Visit Request Declined</h1>
                    <p>The visitor record for <strong>${visitor.visitorName}</strong> has been updated to Rejected status.</p>
                </div>
            `);
        }

    } catch (error) {
        res.status(500).send(`<h1>Server Error: ${error.message}</h1>`);
    }
};


// 6. NEW ENDPOINT: Handle scanning the QR code for Check-out with strict validations
exports.scanCheckOut = async (req, res) => {
    try {
        const { qrDataString } = req.body;

        if (!qrDataString) {
            return res.status(400).json({ success: false, message: "No QR code data provided." });
        }

        // 1. Unpack the JSON string back into a JavaScript object
        let parsedData;
        try {
            parsedData = JSON.parse(qrDataString);
        } catch (parseError) {
            return res.status(400).json({ success: false, message: "Invalid QR code format." });
        }

        const { visitorId } = parsedData;

        if (!visitorId) {
            return res.status(400).json({ success: false, message: "Visitor ID missing from QR data." });
        }

        // 2. Find the visitor in MongoDB
        const visitor = await Visitors.findOne({ visitorId });

        if (!visitor) {
            return res.status(404).json({ success: false, message: "Visitor profile not found." });
        }

        // 3. EDGE-CASE GUARD 1: Prevent checking out someone who hasn't even arrived yet
        if (visitor.status === 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Access Denied: ${visitor.visitorName} cannot check out because they are still listed as Pending entry.` 
            });
        }

        // 4. EDGE-CASE GUARD 2: Prevent double check-outs
        if (visitor.status === 'Checked Out') {
            return res.status(400).json({ 
                success: false, 
                message: `Notice: ${visitor.visitorName} has already checked out of the building since ${visitor.checkOutTime.toLocaleTimeString()}.` 
            });
        }

        // 5. Update the status and stamp the precise departure time
        visitor.status = 'Checked Out';
        visitor.checkOutTime = new Date();
        await visitor.save();

        // 6. Send a friendly departure message back to the scanning terminal
        res.status(200).json({
            success: true,
            message: `Goodbye, ${visitor.visitorName}! Check-out logged successfully at ${visitor.checkOutTime.toLocaleTimeString()}.`,
            data: visitor
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};