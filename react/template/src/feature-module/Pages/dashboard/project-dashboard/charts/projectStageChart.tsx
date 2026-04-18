
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const ProjectStageChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      height: 420,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        distributed: true,
        barHeight: '100%',
        isFunnel: true
      }
    },
    colors: [
      '#3538CD',
      '#06AED4',
      '#FFA201',
      '#0E9384',
      '#27AE60',
      '#E41F07'
    ],
    dataLabels: {
      enabled: true,
      formatter: function (_val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex];
      },
      dropShadow: {
        enabled: true
      }
    },
    xaxis: {
      categories: [
        'Inpipeline : 1454',
        'Follow Up : 1454',
        'Schedule service : 1454',
        'Conversation : 1454',
        'Win : 1454',
        'Lost : 1454'
      ]
    },
    legend: {
      show: false
    }
  };

  const series = [
    {
      name: '',
      data: [1200, 1000, 800, 600, 400, 200]
    }
  ];

  return (
    < >
      <Chart options={options} series={series} type="bar" height={420} />
    </>
  );
};

export default ProjectStageChart;
