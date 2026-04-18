
import Chart from 'react-apexcharts';

const LeadsChart = () => {
  const chartOptions = {
    chart: {
      type: "bar" as const,
      height: 310,
      toolbar: {
        show: false,
      },
    },
    grid: {
      borderColor: '#E8E8E8',
      strokeDashArray: 4,
      padding: {
        right: -20,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        borderRadiusApplication: "around" as "around",
      },
    },
    colors: ['#00918E'],
    yaxis: {
      labels: {
        offsetX: -13,
      },
    },
  };

  const chartSeries = [
    {
      name: 'sales',
      data: [
        { x: 'Inpipeline', y: 400 },
        { x: 'Follow Up', y: 30 },
        { x: 'Schedule', y: 248 },
        { x: 'Conversation', y: 470 },
        { x: 'Won', y: 470 },
        { x: 'Lost', y: 180 },
      ],
    },
  ];

  return (
    <div>
      <Chart options={chartOptions} series={chartSeries} type="bar" height={310} />
    </div>
  );
};

export default LeadsChart;
