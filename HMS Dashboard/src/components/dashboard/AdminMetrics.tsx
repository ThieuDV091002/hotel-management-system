import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useState, useEffect } from "react";

interface MetricsReportDTO {
  customers: number;
  numberOfBookings: number;
}

interface RealTimeMetricsDTO {
  customers: number;
  numberOfBookings: number;
}

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export default function AdminMetrics() {
  const [historicalData, setHistoricalData] = useState<MetricsReportDTO | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetricsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("No access token found");
          console.error("No access token found");
          return;
        }

        const historicalResponse = await fetch(
          "http://localhost:8080/api/audit-reports/1e14a607-ac34-4d4f-9c47-1c4f3a350d3e",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!historicalResponse.ok) {
          throw new Error(
            `Historical report fetch failed! status: ${historicalResponse.status}`
          );
        }

        const historical: MetricsReportDTO = await historicalResponse.json();
        setHistoricalData(historical);

        const customerResponse = await fetch(
          "http://localhost:8080/api/guests/current-count",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!customerResponse.ok) {
          throw new Error(
            `Customer count fetch failed! status: ${customerResponse.status}`
          );
        }

        const customerCount: number = await customerResponse.json();

        const orderResponse = await fetch(
          `http://localhost:8080/api/audit-reports/real-time?reportDate=${today}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!orderResponse.ok) {
          throw new Error(
            `Order count fetch failed! status: ${orderResponse.status}`
          );
        }

        const orderData = await orderResponse.json();
        const orderCount: number = orderData?.numberOfBookings ?? 0;

        setRealTimeData({
          customers: customerCount,
          numberOfBookings: orderCount,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load metrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentageChange = (current: number, historical: number): number => {
    if (historical === 0) return 0;
    const percentage = ((current - historical) / historical) * 100;
    return percentage;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.abs(value).toFixed(2)}%`;
  };

  const getBadgeProps = (percentage: number) => ({
    color: percentage >= 0 ? "success" : "error" as BadgeColor,
    icon: percentage >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />,
  });

  const ordersPercentage =
    realTimeData?.numberOfBookings != null && historicalData?.numberOfBookings != null
      ? calculatePercentageChange(realTimeData.numberOfBookings, historicalData.numberOfBookings)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6">
      {/* Customers Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : realTimeData?.customers?.toLocaleString() || "0"}
            </h4>
          </div>
        </div>
      </div>

      {/* Orders Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bookings
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : realTimeData?.numberOfBookings?.toLocaleString() || "0"}
            </h4>
          </div>
          {!isLoading && !error && realTimeData && historicalData && (
            <Badge color={getBadgeProps(ordersPercentage).color}>
              {getBadgeProps(ordersPercentage).icon}
              {formatPercentage(ordersPercentage)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}