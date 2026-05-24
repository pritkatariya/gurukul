import { FaArrowUp, FaChartBar, FaChartLine } from "react-icons/fa";
import { ChartCard } from "../../pages/Deshbord";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";

export default function AdminBoard() {
    const zeroMonthlyData = [
        { month: "Jan", SevaProgress: 0 },
        { month: "Feb", SevaProgress: 0 },
        { month: "Mar", SevaProgress: 0 },
        { month: "Apr", SevaProgress: 0 },
        { month: "May", SevaProgress: 0 }
    ];
    const zeroWeeklyData = [
        { day: "Mon", Seva: 0 },
        { day: "Tue", Seva: 0 },
        { day: "Wed", Seva: 0 },
        { day: "Thu", Seva: 0 },
        { day: "Fri", Seva: 0 },
        { day: "Sat", Seva: 0 },
        { day: "Sun", Seva: 0 }
    ];
    const monthlyOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "line",
                height: 200,
                toolbar: { show: false },
                animations: { enabled: false }
            },
            stroke: { curve: "smooth", width: 3, colors: ["#991b1b"] },
            markers: { size: 4, colors: ["#fff"], strokeColors: "#991b1b", strokeWidth: 2 },
            grid: {
                borderColor: "#f1f5f9",
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: zeroMonthlyData.map((data) => data.month),
                labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: { style: { colors: "#94a3b8", fontSize: "11px" } }
            },
            tooltip: { theme: "light" }
        }),
        []
    );

    const monthlySeries = [
        { name: "Monthly Growth", data: zeroMonthlyData.map((data) => data.SevaProgress) }
    ];




    const weeklyOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "line",
                height: 200,
                toolbar: { show: false },
                animations: { enabled: false }
            },
            stroke: { curve: "smooth", width: 3, colors: ["#b91c1c"] },
            markers: { size: 4, colors: ["#fff"], strokeColors: "#b91c1c", strokeWidth: 2 },
            grid: {
                borderColor: "#f1f5f9",
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: zeroWeeklyData.map((data) => data.day),
                labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: { style: { colors: "#94a3b8", fontSize: "11px" } }
            },
            tooltip: { theme: "light" }
        }),
        []
    );

    const weeklySeries = [{ name: "Seva Progress", data: zeroWeeklyData.map((data) => data.Seva) }];


    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard
                title="My Weekly Growth"
                subtitle="Daily analysis from Monday to Sunday"
                badge="0%"
                icon={<FaChartBar className="text-red-800" />}
                options={weeklyOptions}
                series={weeklySeries}
            />

            <ChartCard
                title="My Monthly Growth"
                subtitle="Tracking contribution graph over 5 months"
                badge="+0%"
                icon={<FaChartLine className="text-red-800" />}
                badgeIcon={<FaArrowUp />}
                options={monthlyOptions}
                series={monthlySeries} />
        </div>
    )
}
