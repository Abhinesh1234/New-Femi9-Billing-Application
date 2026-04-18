
import Chart from 'react-apexcharts';
import type { ApexOptions } from "apexcharts";
const ProjectTypeChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'donut'
    },
    colors: ['#4A00E5', '#5CB85C', '#339DFF', '#FFA201'],
    labels: ['Plan', 'Completed', 'Develop', 'Design'],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom',
      formatter: function (val, opts) {
        return `${val} - ${opts.w.globals.series[opts.seriesIndex]}`;
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const series = [34, 55, 50, 17];

  return (
    <div id="project-type">
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export default ProjectTypeChart;
