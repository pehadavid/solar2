import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SolarResolverService} from '../solar-resolver.service';
import {CompleteSolarModel} from '../../models/CompleteSolarModel';
import * as Chart from 'chart.js';
import * as moment from 'moment';


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
        const date = x.Date.format('MMM Do YYYY');
        const minutes: number = +x.getSolarTotal().asMinutes().toFixed(0);
        const h = x.getSolarTotal().hours();
        const color = h < 12 ? 'rgba(134, 136, 255, 1)' : 'rgba(213, 144, 125, 1)';
        const sunset = x.Sunset;
        const sunrise = x.Sunrise;
        return {
          date,
          minutes,
          color,
          sunrise,
          sunset
        };
      });

    this.chart = new Chart(canvasContext, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Minutes of sun',
            data: items.map(x => x.minutes),
            backgroundColor: items.map(x => x.color),
          },
          {
            label: 'Sunrise',
            data: items.map(x => {
              return x.sunrise.hours() * 60 + x.sunrise.minutes();
            }),

            // Changes this dataset to become a line
            type: 'line',
            borderColor: 'yellow',
            backgroundColor: 'transparent'
          },
          {
            label: 'Sunset',
            data: items.map(x => {
              return x.sunset.hours() * 60 + x.sunset.minutes();
            }),

            // Changes this dataset to become a line
            type: 'line',
            borderColor: 'red',
            backgroundColor: 'transparent'
          }],
        labels: items.map(x => x.date)
      },
      options: {
        tooltips: {
          callbacks: {
            label: (item, data) => {
              const rawValue = +data.datasets[item.datasetIndex].data[item.index];
              // sunrise / sunset
              const nbHours = Math.floor(rawValue / 60);
              const nbMinutes = rawValue - (nbHours * 60);
              const prelabel = `${nbHours}h${nbMinutes}`;
              if (item.datasetIndex > 0) {
                let mm = moment.utc(item.xLabel + ' 00:00:00', 'MMM Do YYYY HH:mm:ss', true);
                mm = mm.minutes(nbMinutes);
                mm = mm.hours(nbHours);

                return mm.local().format('HH:mm z');
              }
              else {
                return prelabel;
              }
            }
          }
        }
      }

    });
  }

}
