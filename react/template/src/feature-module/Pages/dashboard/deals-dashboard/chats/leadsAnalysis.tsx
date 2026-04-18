import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
const LeadsAnalysisChart = () => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
    },
    colors: ["#0092E4", "#4A00E5", "#E41F07", "#FFA201"],
    labels: ["Campaigns", "Google", "Referrals", "Paid Social"],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          size: "65%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      formatter: function (val, opts) {
        return `${val} - ${opts.w.globals.series[opts.seriesIndex]}`;
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = [44, 55, 41, 17];

  return (
    <>
      <Chart options={options} series={series} type="donut" height={350} />
    </>
  );
};

export default LeadsAnalysisChart;
