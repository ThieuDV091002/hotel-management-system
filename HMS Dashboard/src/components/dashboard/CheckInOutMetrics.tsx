import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useState, useEffect } from "react";

interface AuditReportDTO {
  checkIns: number;
  checkOuts: number;
}

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface RealTimeAuditReportDTO {
  checkIns: number;
  checkOuts: number;
}

export default function EcommerceMetrics() {
  const [historicalData, setHistoricalData] = useState<AuditReportDTO | null>(
    null
  );
  const [realTimeData, setRealTimeData] = useState<RealTimeAuditReportDTO | null>(
    null
  );
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

        const historical: AuditReportDTO = await historicalResponse.json();
        setHistoricalData(historical);

        const realTimeResponse = await fetch(
          `http://localhost:8080/api/audit-reports/real-time?reportDate=${today}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!realTimeResponse.ok) {
          throw new Error(
            `Real-time report fetch failed! status: ${realTimeResponse.status}`
          );
        }

        const realTime: RealTimeAuditReportDTO = await realTimeResponse.json();
        setRealTimeData(realTime);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load metrics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentageChange = (
    current: number,
    historical: number
    ): number => {
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

  const checkInsPercentage =
    realTimeData?.checkIns != null && historicalData?.checkIns != null
        ? calculatePercentageChange(realTimeData.checkIns, historicalData.checkIns)
        : 0;

  const checkOutsPercentage =
    realTimeData?.checkOuts != null && historicalData?.checkOuts != null
        ? calculatePercentageChange(realTimeData.checkOuts, historicalData.checkOuts)
        : 0;


  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6">
      {/* Check-Ins Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Check-Ins
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : realTimeData?.checkIns?.toLocaleString() || "0"}
            </h4>
          </div>
          {!isLoading && !error && realTimeData && historicalData && (
            <Badge
              color={getBadgeProps(checkInsPercentage).color}
            >
              {getBadgeProps(checkInsPercentage).icon}
              {formatPercentage(checkInsPercentage)}
            </Badge>
          )}
        </div>
      </div>

      {/* Check-Outs Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Check-Outs
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : realTimeData?.checkOuts?.toLocaleString() || "0"}
            </h4>
          </div>
          {!isLoading && !error && realTimeData && historicalData && (
            <Badge
              color={getBadgeProps(checkOutsPercentage).color}
            >
              {getBadgeProps(checkOutsPercentage).icon}
              {formatPercentage(checkOutsPercentage)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}