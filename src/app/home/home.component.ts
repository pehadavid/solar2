import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {SolarResolverService} from '../solar-resolver.service';
import {CompleteSolarModel} from '../../models/CompleteSolarModel';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import {isPlatformBrowser} from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  translateValue: number;
  mainSolarInfo: CompleteSolarModel;
  chart: any;
  now: moment.Moment;

  constructor(private solarResolver: SolarResolverService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.translateValue = 0;
    this.mainSolarInfo = null;
    moment.locale('fr');
    this.now = moment();
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
    if (isPlatformBrowser(this.platformId)) {
      const canvas = document.querySelector('#chart') as HTMLCanvasElement;
      const canvasContext = canvas.getContext('2d');
      const lastTotal = -100;
      const itemArray = Array.from(this.mainSolarInfo.relativeMap.values());
      const items = Array.from(this.mainSolarInfo.relativeMap.values())
        .filter(x => x.Date.isAfter(this.mainSolarInfo.currentSolarInfo.Date))
        .map((x, index) => {

          const previous = itemArray[index + 1];
          const diff = x.getSolarTotal().subtract(previous.getSolarTotal());
          const date = x.Date.format('MMM Do YYYY');
          const minutes: number = +x.getSolarTotal().asMinutes().toFixed(0);

          const h = x.getSolarTotal().hours();
          const color = h < 12 ? 'rgba(134, 136, 255, 1)' : 'rgba(213, 144, 125, 1)';
          const sunset = x.Sunset;
          const sunrise = x.Sunrise;
          return {
            date,
            minutes,
            diff,
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
              data: items.map(x => {
                return x.minutes;
              }),
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
                } else {
                  const mappedItem = items[item.index];
                  return `${prelabel} (${mappedItem.diff.minutes()}:${mappedItem.diff.seconds()})`;

                }
              }
            }
          }
        }

      });
    }

  }

}
