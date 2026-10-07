const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Opportunity = require("../models/Opportunity");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalLeads,
      openLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities
    ] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({
        status: {
          $nin: ["Converted", "Lost"]
        }
      }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({
        status: "Open"
      }),
      Opportunity.countDocuments({
        status: "Won"
      }),
      Opportunity.countDocuments({
        status: "Lost"
      })
    ]);

    const openPipeline = await Opportunity.find({
      status: "Open"
    }).select("amount probability");

    const totalPipelineValue = openPipeline.reduce(
      (total, opportunity) =>
        total + (opportunity.amount * opportunity.probability) / 100,
      0
    );

    res.status(200).json({
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
    res.status(500).json({
      message: "Failed to fetch dashboard statistics"
    });
  }
};

module.exports = {
  getDashboardStats
};