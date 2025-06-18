import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";

export default function MonthlyBookingsChart() {
  const [series, setSeries] = useState([
    {
      name: "Bookings",
      data: Array(12).fill(0),
    },
  ]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("No access token found");
          console.error("No access token found");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/bookings/monthly-bookings?year=${selectedYear}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const stats = await response.json();

        const monthMap: { [key: string]: string } = {
          january: "Jan",
          february: "Feb",
          march: "Mar",
          april: "Apr",
          may: "May",
          june: "Jun",
          july: "Jul",
          august: "Aug",
          september: "Sep",
          october: "Oct",
          november: "Nov",
          december: "Dec",
        };

        const monthsOrder = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const bookingCounts = monthsOrder.map((month) => {
          const stat = stats.find(
            (s: { month: string; bookingCount: number }) =>
              monthMap[s.month.toLowerCase()] === month
          );
          const count = stat ? stat.bookingCount : 0;
          return count;
        });

        setSeries([{ name: "Bookings", data: bookingCounts }]);
      } catch (error) {
        console.error("Error fetching booking stats:", error);
        setError("Failed to load booking data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingStats();
  }, [selectedYear]);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} bookings`,
      },
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    closeDropdown();
  };

  const years = [2023, 2024, 2025];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Bookings
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            {years.map((year) => (
              <DropdownItem
                key={year}
                onItemClick={() => handleYearSelect(year)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                {year}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Chart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}