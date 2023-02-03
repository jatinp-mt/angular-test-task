import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
})
export class PieChartComponent {
  @Input() pieData: any;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Open', 'Due', 'Completed'],
    datasets: [],
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

  ngOnInit() {
    if (this.pieData && this.pieData.length) {
      this.formatDataToPlotOnCharts(this.pieData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.formatDataToPlotOnCharts(this.pieData)
  }

  formatDataToPlotOnCharts = (pieData: any) => {
    const temp = this.groupByDates(pieData);
      this.pieChartData.datasets = [
        {
          data: [temp.openCount, temp.dueCount, temp.completedCount],
          backgroundColor: ['#91cc75', '#fac858', '#5470c6'],
        },
      ];

      this.chart?.update();
  };

  // group by status and take the counts
  groupByDates = (data: any) => {
    let openCount = 0;
    let dueCount = 0;
    let completedCount = 0;
    data?.map((item: any) => {
      if (item['Task Status'] === 'Open') {
        openCount++
      } else if(item['Task Status'] === 'COMPLETED') {
        completedCount++
      } else {
        dueCount++
      }
    });
    return { openCount, dueCount, completedCount };
  };
}
