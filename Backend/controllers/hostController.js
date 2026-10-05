const User = require("../models/User");

const getHosts = async (req, res) => {
  try {
    const hosts = await User.find({ role: "host" }).select("-password");

    res.status(200).json({
      success: true,
      message: "Hosts retrieved successfully",
      data: hosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve hosts",
      data: null,
    });
  }
};

const getHostById = async (req, res) => {
  try {
    const host = await User.findOne({
      _id: req.params.id,
      role: "host",
    }).select("-password");

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Host retrieved successfully",
      data: host,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve host",
      data: null,
    });
  }
};

module.exports = {
  getHosts,
  getHostById,
};