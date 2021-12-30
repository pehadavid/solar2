import { Component, Input, OnInit } from '@angular/core';
import { ChartModel } from 'src/app/models/chart-model';
import * as Chart from 'chart.js';
import * as moment from 'moment';
@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.scss']
})
export class DurationComponent implements OnInit {

  @Input() items: ChartModel[];
  chart: any;
  constructor() { }

  ngOnInit(): void {
    const canvas = document.querySelector('#duration-chart') as HTMLCanvasElement;
    const canvasContext = canvas.getContext('2d');
    this.chart = new Chart(canvasContext, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Durée du jour',
            data: this.items.map(x => {
              return x.seconds;
            }),
            backgroundColor: this.items.map(x => x.color),
          }],
        labels: this.items.map(x => x.date)
      },
      options: {
        tooltips: {
          callbacks: {
            label: (item, data) => {
              const rawValue = +data.datasets[item.datasetIndex].data[item.index];
              const date = new Date(0);
              date.setSeconds(rawValue);
              // sunrise / sunset
              const nbHours = date.getUTCHours();
              const nbMinutes = date.getMinutes();
              const prelabel = `${nbHours}h${nbMinutes}`;
              if (item.datasetIndex > 0) {
                let mm = moment.utc(item.xLabel + ' 00:00:00', 'MMM Do YYYY HH:mm:ss', true);
                mm = mm.minutes(nbMinutes);
                mm = mm.hours(nbHours);

                return mm.local().format('HH:mm z');
              } else {
                const mappedItem = this.items[item.index];
                return `${prelabel} (${mappedItem.diff.minutes()}:${mappedItem.diff.seconds()})`;

              }
            }
          }
        }
      }

    });
  }

}
