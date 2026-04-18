
import Chart from 'react-apexcharts';
import type { ApexOptions } from "apexcharts";

const TaskYearChart = () => {
  const options: ApexOptions = {
    chart: {
      height: 273,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    colors: ['#3C2371'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'stepline'
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yaxis: {
      min: 10,
      max: 60,
      tickAmount: 5,
      labels: {
        formatter: (val:any) => `${val}K`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  };

  const series = [
    {
      name: 'Task',
      data: [10, 38, 18, 47, 13, 32, 15, 40, 18, 50, 30, 15]
    }
  ];

  return (
    <div id="task-year">
      <Chart options={options} series={series} type="line" height={273} />
    </div>
  );
};

export default TaskYearChart;
