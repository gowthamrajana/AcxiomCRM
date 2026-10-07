import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        pipelineResponse,
        salesResponse
      ] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/opportunities/pipeline"),
        api.get("/reports/monthly-sales")
      ]);

      setStats(
        statsResponse.data?.data ||
        statsResponse.data ||
        {}
      );

      const pipelineData =
        pipelineResponse.data?.data ||
        pipelineResponse.data?.pipeline ||
        pipelineResponse.data ||
        [];

      setPipeline(
        Array.isArray(pipelineData)
          ? pipelineData
          : []
      );

      const salesData =
        salesResponse.data?.data ||
        salesResponse.data?.sales ||
        salesResponse.data ||
        [];

      setMonthlySales(
        Array.isArray(salesData)
          ? salesData
          : []
      );
    } catch (error) {
      setError(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const dashboardStats = stats || {};

  const totalCustomers =
    dashboardStats.totalCustomers ??
    dashboardStats.customers ??
    0;

  const totalLeads =
    dashboardStats.totalLeads ??
    dashboardStats.leads ??
    0;

  const openLeads =
    dashboardStats.openLeads ??
    0;

  const totalOpportunities =
    dashboardStats.totalOpportunities ??
    dashboardStats.opportunities ??
    0;

  const openOpportunities =
    dashboardStats.openOpportunities ??
    0;

  const wonOpportunities =
    dashboardStats.wonOpportunities ??
    dashboardStats.won ??
    0;

  const lostOpportunities =
    dashboardStats.lostOpportunities ??
    dashboardStats.lost ??
    0;

  const totalPipelineValue =
    dashboardStats.totalPipelineValue ??
    dashboardStats.pipelineValue ??
    0;

  const leadStatusData = {
    labels: [
      "New",
      "Contacted",
      "Qualified",
      "Unqualified",
      "Converted",
      "Lost"
    ],
    datasets: [
      {
        label: "Leads",
        data: [
          dashboardStats.newLeads ?? 0,
          dashboardStats.contactedLeads ?? 0,
          dashboardStats.qualifiedLeads ?? 0,
          dashboardStats.unqualifiedLeads ?? 0,
          dashboardStats.convertedLeads ?? 0,
          dashboardStats.lostLeads ?? 0
        ]
      }
    ]
  };

  const pipelineLabels = pipeline.map(
    (item) =>
      item.stage ||
      item._id ||
      item.name ||
      "Unknown"
  );

  const pipelineValues = pipeline.map(
    (item) =>
      Number(
        item.value ??
        item.amount ??
        item.totalAmount ??
        item.total ??
        0
      )
  );

  const pipelineChartData = {
    labels: pipelineLabels,
    datasets: [
      {
        label: "Pipeline Value",
        data: pipelineValues
      }
    ]
  };

  const salesLabels = monthlySales.map(
    (item) =>
      item.month ||
      item.label ||
      item._id ||
      "Unknown"
  );

  const salesValues = monthlySales.map(
    (item) =>
      Number(
        item.sales ??
        item.totalSales ??
        item.amount ??
        item.total ??
        0
      )
  );

  const monthlySalesChartData = {
    labels: salesLabels,
    datasets: [
      {
        label: "Monthly Sales",
        data: salesValues,
        tension: 0.3
      }
    ]
  };

  const cards = [
    {
      title: "Total Customers",
      value: totalCustomers
    },
    {
      title: "Total Leads",
      value: totalLeads
    },
    {
      title: "Open Leads",
      value: openLeads
    },
    {
      title: "Total Opportunities",
      value: totalOpportunities
    },
    {
      title: "Open Opportunities",
      value: openOpportunities
    },
    {
      title: "Won Opportunities",
      value: wonOpportunities
    },
    {
      title: "Lost Opportunities",
      value: lostOpportunities
    },
    {
      title: "Total Pipeline Value",
      value: `₹${Number(
        totalPipelineValue
      ).toLocaleString("en-IN")}`
    }
  ];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Dashboard
          </h1>

          <p className="text-muted mb-0">
            CRM overview and sales performance
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadDashboard}
        >
          Refresh
        </button>
      </div>

      <AlertMessage
        message={error}
        type="danger"
        onClose={() => setError("")}
      />

      <div className="row g-4 mb-4">
        {cards.map((card) => (
          <div
            className="col-12 col-sm-6 col-lg-3"
            key={card.title}
          >
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <p className="text-muted mb-2">
                  {card.title}
                </p>

                <h2 className="fw-bold mb-0">
                  {card.value}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                Lead Status
              </h5>

              <div style={{ height: "320px" }}>
                <Bar
                  data={leadStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                Opportunity Pipeline
              </h5>

              <div style={{ height: "320px" }}>
                {pipeline.length > 0 ? (
                  <Doughnut
                    data={pipelineChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    No pipeline data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                Monthly Sales
              </h5>

              <div style={{ height: "350px" }}>
                {monthlySales.length > 0 ? (
                  <Line
                    data={monthlySalesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    No monthly sales data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}