
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Opportunity = require("../models/Opportunity");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalLeads,
      convertedLeads,
      lostLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities
    ] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "Converted" }),
      Lead.countDocuments({ status: "Lost" }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: "Open" }),
      Opportunity.countDocuments({ status: "Won" }),
      Opportunity.countDocuments({ status: "Lost" })
    ]);

    const openLeads = Math.max(
      0,
      totalLeads - convertedLeads - lostLeads
    );

    const openPipeline = await Opportunity.find({
      status: "Open"
    }).select("amount probability");

    const totalPipelineValue = openPipeline.reduce(
      (total, opportunity) => {
        const amount = Number(opportunity.amount) || 0;
        const probability = Number(opportunity.probability) || 0;

        return total + (amount * probability) / 100;
      },
      0
    );

    return res.status(200).json({
      totalCustomers,
      totalLeads,
      openLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      totalPipelineValue
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard statistics"
    });
  }
};

module.exports = {
  getDashboardStats
};
