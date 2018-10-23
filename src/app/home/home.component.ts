import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SolarResolverService} from '../solar-resolver.service';
import {CompleteSolarModel} from '../../models/CompleteSolarModel';
import * as Chart from 'chart.js';
import {ChartConfiguration, ChartData, ChartOptions} from 'chart.js';
import {ChartDataSets} from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  translateValue: number;
  mainSolarInfo: CompleteSolarModel;
  @ViewChild('canvas') canvas;
  chart: any;

  constructor(private solarResolver: SolarResolverService) {
    this.translateValue = 0;
    this.mainSolarInfo = null;
    this.solarResolver.onMainSolarInfoUpdated.subscribe(r => {
      this.mainSolarInfo = r;
      this.updateChart();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {


  }

  updateChart(): void {
    const canvasContext = this.canvas.nativeElement.getContext('2d');
    const items = Array.from(this.mainSolarInfo.relativeMap.values())
      .filter(x => x.Date.isAfter(this.mainSolarInfo.currentSolarInfo.Date))
      .map(x => {
        const date = x.Date.format('MMM Do YY');
        const minutes: number = +x.getSolarTotal().asMinutes().toFixed(0);
        const h = x.getSolarTotal().hours();
        const color = h < 12 ? 'rgba(134, 136, 255, 1)' : 'rgba(213, 144, 125, 1)';

        return {
          date,
          minutes,
          color
        };
      });

    const dataset = <ChartDataSets> {
      label: 'minutes of sun',
      data: items.map(x => x.minutes),
      backgroundColor: items.map(x => x.color),
    };
    const chartConfig = <ChartConfiguration> {
      type: 'bar',
      data: <ChartData> {
        labels: items.map(x => x.date),
        datasets: [dataset]
      },
    };
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(canvasContext, chartConfig);

  }

}
