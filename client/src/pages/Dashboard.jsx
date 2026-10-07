import { useEffect, useState } from "react";
import {
  Bar,
  Doughnut,
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import api, { getApiError } from "../services/api";
import Loading from "../components/Loading";
import AlertMessage from "../components/AlertMessage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const getArray = (data, keys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getNumber = (object, keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined) {
      return Number(object[key]) || 0;
    }
  }

  return 0;
};

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [pipeline, setPipeline] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get("/dashboard/stats"),
          api.get("/opportunities/pipeline"),
          api.get("/reports/monthly-sales")
        ]);

        if (results[0].status === "fulfilled") {
          setStats(results[0].value.data || {});
        }

        if (results[1].status === "fulfilled") {
          setPipeline(
            getArray(
              results[1].value.data,
              ["pipeline", "data", "results"]
            )
          );
        }

        if (results[2].status === "fulfilled") {
          setMonthlySales(
            getArray(
              results[2].value.data,
              ["monthlySales", "sales", "data", "results"]
            )
          );
        }

        const failed = results.find(
          (result) => result.status === "rejected"
        );

        if (failed) {
          setError(
            getApiError(
              failed.reason,
              "Some dashboard data could not be loaded."
            )
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const leadStatusData =
    stats.leadsByStatus ||
    stats.leadStatus ||
    [];

  const leadArray = getArray(
    leadStatusData,
    ["data", "results"]
  );

  const leadLabels = leadArray.map(
    (item) =>
      item.status ||
      item._id ||
      item.label ||
      "Unknown"
  );

  const leadValues = leadArray.map(
    (item) =>
      item.count ??
      item.total ??
      item.value ??
      0
  );

  const pipelineLabels = pipeline.map(
    (item) =>
      item.stage ||
      item._id ||
      item.label ||
      "Unknown"
  );

  const pipelineValues = pipeline.map(
    (item) =>
      item.weightedValue ??
      item.value ??
      item.amount ??
      item.total ??
      0
  );

  const salesLabels = monthlySales.map(
    (item) =>
      item.month ||
      item._id ||
      item.label ||
      "Unknown"
  );

  const salesValues = monthlySales.map(
    (item) =>
      item.total ??
      item.amount ??
      item.sales ??
      item.value ??
      0
  );

  const cards = [
    {
      title: "Total Customers",
      value: getNumber(stats, [
        "totalCustomers",
        "customers"
      ])
    },
    {
      title: "Total Leads",
      value: getNumber(stats, [
        "totalLeads",
        "leads"
      ])
    },
    {
      title: "Open Leads",
      value: getNumber(stats, [
        "openLeads"
      ])
    },
    {
      title: "Total Opportunities",
      value: getNumber(stats, [
        "totalOpportunities",
        "opportunities"
      ])
    },
    {
      title: "Open Opportunities",
      value: getNumber(stats, [
        "openOpportunities"
      ])
    },
    {
      title: "Won Opportunities",
      value: getNumber(stats, [
        "wonOpportunities"
      ])
    },
    {
      title: "Lost Opportunities",
      value: getNumber(stats, [
        "lostOpportunities"
      ])
    },
    {
      title: "Total Pipeline Value",
      value: getNumber(stats, [
        "totalPipelineValue",
        "pipelineValue"
      ])
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            Overview of customers, leads and opportunities.
          </p>
        </div>
      </div>

      <AlertMessage
        message={error}
        type="warning"
        onClose={() => setError("")}
      />

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={card.title}
          >
            <div className="kpi-card">
              <div className="kpi-title">
                {card.title}
              </div>

              <div className="kpi-value">
                {card.value.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="chart-card">
            <h5>Lead Status</h5>

            <Doughnut
              data={{
                labels: leadLabels,
                datasets: [
                  {
                    label: "Leads",
                    data: leadValues
                  }
                ]
              }}
            />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="chart-card">
            <h5>Opportunity Pipeline</h5>

            <Bar
              data={{
                labels: pipelineLabels,
                datasets: [
                  {
                    label: "Pipeline",
                    data: pipelineValues
                  }
                ]
              }}
            />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="chart-card">
            <h5>Monthly Sales</h5>

            <Line
              data={{
                labels: salesLabels,
                datasets: [
                  {
                    label: "Sales",
                    data: salesValues,
                    tension: 0.3
                  }
                ]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}