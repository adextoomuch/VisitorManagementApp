const mongoose = require("mongoose");
const Counter = require("./Counter"); // Import the counter model 

const visitorSchema = new mongoose.Schema({
    visitorId:{
        type: String,
        unique : true,
    },

    visitorName:{
        type: String,
        required: [true, "Mobile no is required"]
    },

    mobileNo:{
        type: Number,
        required: [true, "Mobile No is required"]
    },

    address:{
        type: String
    },

    whomToMeet:{
        type: [String],
        required: [true, "You must enter whom to meet"]
    },

    purpose:{
        type: String
    },

    dateOfVisit:{
        type: Date
    },

    email:{
        type: String,
        required : true
    },

    // 1. ADDED STATUS FIELD: Tracks the visitor lifecycle stages
    status: {
        type: String,
        enum: ['Pending Approval', 'Approved' , 'Rejected' , 'Checked In', 'Checked Out', ''],
        default: 'Pending Approval'
    },

    // 2. ADDED CHECK-IN TIMESTAMP FIELD: Captures the exact moment they scan
    checkInTime: {
        type: Date
    },
    // 3. ADD THIS NOW: Tracks the exact moment they leave
    checkOutTime: {
        type: Date
    }
},

    {timestamps: true} // Date created and updated at
);

visitorSchema.pre("save", async function () {
  const doc = this;

  // Only generate a visitorId if one doesn't exist yet
  if (!doc.visitorId) {
    // Fixed the deprecation warning by changing 'new: true' to 'returnDocument: "after"'
    const counter = await Counter.findOneAndUpdate(
      { id: "visitorSequence" },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    // This assigns your auto-generated code successfully
    doc.visitorId = `VID-${String(counter.seq).padStart(4, '0')}`;
  }
});

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


module.exports = mongoose.model("Visitors", visitorSchema);
