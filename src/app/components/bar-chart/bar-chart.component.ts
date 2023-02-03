import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @Input() barData: any;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {},
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  ngOnInit() {
    if (this.barData && this.barData.length) {
      this.formatDataToPlotOnCharts(this.barData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.formatDataToPlotOnCharts(this.barData)
  }

  formatDataToPlotOnCharts = (barData: any) => {
    const temp = this.groupByDates(barData);

    this.barChartData.labels = temp.map((aItem: any) => {
      return aItem['date'];
    });
    this.barChartData.datasets = [
      {
        data: temp.map((aItem: any) => {
          return aItem['trueCount'];
        }),
        label: 'Compliant',
        backgroundColor: '#fac858',
      },
      {
        data: temp.map((aItem: any) => {
          return aItem['falseCount'];
        }),
        label: 'Non Compliant',
        backgroundColor: '#5470c6',
      },
    ];

    this.chart?.update();
  };

  // group by date and take the counts
  groupByDates = (data: any) => {
    let resultData = [];

    let dateArr = data?.map((dt: any) => dt.TskDuedate);
    dateArr = Array.from(new Set(dateArr));

    resultData = dateArr?.map((date: any) => {
      let trueCount = 0;
      let falseCount = 0;

      data?.map((item: any) => {
        if (item['TskDuedate'] === date)
          if (item['isCompliant']) trueCount++;
          else falseCount++;
      });

      return { date, trueCount, falseCount };
    });

    return resultData;
  };
}
