import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
const ContactReportChart = () => {
  const options: ApexOptions = {
    chart: {
      height: 273,
      type: "area",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#4A00E5"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#E8E8E8",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      min: 1,
      max: 6,
      tickAmount: 5,
      labels: {
        offsetX: -15,
        formatter: (val) => `${val}K`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };

  const series = [
    {
      name: "Reports",
      data: [3, 4.5, 2.0, 3.0, 2.5, 4, 2, 4, 3.5, 5, 3, 2],
    },
  ];

  return (
    <>
      <Chart options={options} series={series} type="area" height={273} />
    </>
  );
};

export default ContactReportChart;
