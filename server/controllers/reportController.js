const Opportunity = require("../models/Opportunity");

const getMonthlySales = async (req, res) => {
  try {
    const sales = await Opportunity.aggregate([
      {
        $match: {
          status: "Won"
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$updatedAt"
            },
            month: {
              $month: "$updatedAt"
            }
          },
          totalSales: {
            $sum: "$amount"
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch monthly sales"
    });
  }
};

const getConversionReport = async (req, res) => {
  try {
    const totalLeads = await require("../models/Lead").countDocuments();

    const convertedLeads = await require("../models/Lead").countDocuments({
      status: "Converted"
    });

    const conversionRate =
      totalLeads === 0
        ? 0
        : (convertedLeads / totalLeads) * 100;

    res.status(200).json({
      totalLeads,
      convertedLeads,
      conversionRate
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch conversion report"
    });
  }
};

module.exports = {
  getMonthlySales,
  getConversionReport
};