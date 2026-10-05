const Blocklist = require("../models/Blocklist");

const checkBlocklist = async ({ email, mobileNo }) => {
  const conditions = [];

  if (email) {
    conditions.push({
      email: email.toLowerCase().trim(),
      active: true,
    });
  }

  if (mobileNo) {
    conditions.push({
      mobileNo: String(mobileNo).trim(),
      active: true,
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  const blockedVisitor = await Blocklist.findOne({
    $or: conditions,
  });

  return blockedVisitor;
};

module.exports = {
  checkBlocklist,
};


