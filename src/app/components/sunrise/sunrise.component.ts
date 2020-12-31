import { Component, Input, OnInit } from '@angular/core';
import { ChartModel } from 'src/app/models/chart-model';
import * as Chart from 'chart.js';
import * as moment from 'moment';
@Component({
  selector: 'app-sunrise',
  templateUrl: './sunrise.component.html',
  styleUrls: ['./sunrise.component.scss']
})
export class SunriseComponent implements OnInit {

  @Input() items: ChartModel[];
  chart: any;
  constructor() { }

  ngOnInit(): void {
    const canvas = document.querySelector('#sunrise-chart') as HTMLCanvasElement;
    const canvasContext = canvas.getContext('2d');
    this.chart = new Chart(canvasContext, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Levé du soleil',
            data: this.items.map(x => {
              return x.sunrise.hours() * 60 + x.sunrise.minutes();
            }),

            // Changes this dataset to become a line
            type: 'line',
            borderColor: '#a56890',
            backgroundColor: 'transparent'
          },
          {
            label: 'Couché du soleil',
            data: this.items.map(x => {
              return x.sunset.hours() * 60 + x.sunset.minutes();
            }),

            // Changes this dataset to become a line
            type: 'line',
            borderColor: '#bb885f',
            backgroundColor: 'transparent'
          }],
        labels: this.items.map(x => x.date)
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
              if (true) {
                let mm = moment.utc(item.xLabel + ' 00:00:00', 'MMM Do YYYY HH:mm:ss', true);
                mm = mm.minutes(nbMinutes);
                mm = mm.hours(nbHours);

                return mm.local().format('HH:mm z');
              } 
            }
          }
        }
      }

    });
  }
  

}
