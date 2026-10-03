const Visitors = require("../models/Visitors");

exports.getVisitorReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate",
      });
    }

    const visitors = await Visitors.find({
      dateOfVisit: {
        $gte: start,
        $lte: end,
      },
    }).sort({ dateOfVisit: -1 });

    const summary = {
      total: visitors.length,
      pendingApproval: visitors.filter(
        (visitor) => visitor.status === "Pending Approval",
      ).length,
      approved: visitors.filter((visitor) => visitor.status === "Approved")
        .length,
      rejected: visitors.filter((visitor) => visitor.status === "Rejected")
        .length,
      checkedIn: visitors.filter((visitor) => visitor.status === "Checked In")
        .length,
      checkedOut: visitors.filter((visitor) => visitor.status === "Checked Out")
        .length,
    };

    const purposeBreakdown = {};

    visitors.forEach((visitor) => {
      const purpose = visitor.purpose?.trim() || "Not specified";

      purposeBreakdown[purpose] = (purposeBreakdown[purpose] || 0) + 1;
    });

    const dailyBreakdown = {};

    visitors.forEach((visitor) => {
      if (!visitor.dateOfVisit) return;

      const date = new Date(visitor.dateOfVisit).toISOString().split("T")[0];

      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      filters: {
        startDate,
        endDate,
      },
      summary,
      purposeBreakdown,
      dailyBreakdown,
      data: visitors,
    });
  } catch (error) {
    console.error("Visitor report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate visitor report",
      error: error.message,
    });
  }
};
