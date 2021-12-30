import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {SolarResolverService} from '../solar-resolver.service';
import {CompleteSolarModel} from '../../models/CompleteSolarModel';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import {isPlatformBrowser} from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ChartModel } from '../models/chart-model';


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
  chartItems: ChartModel[];
  isBrowser: boolean;

  constructor(private solarResolver: SolarResolverService,
              @Inject(PLATFORM_ID) private platformId: Object,
              titleService: Title,
              metaService: Meta,
              private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(platformId);
    titleService.setTitle('Mamasoleil.fr - heure de levé et couché de soleil');
    metaService.updateTag({ name: 'description', content: `Heures de levé et de couché du soleil a votre position en temps réel !`});
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
    this.mainSolarInfo = this.route.snapshot.data.item as CompleteSolarModel;
  }

  ngAfterViewInit(): void {


  }

  updateChart(): void {
    if (isPlatformBrowser(this.platformId)) {
      // const canvas = document.querySelector('#chart') as HTMLCanvasElement;
      // const canvasContext = canvas.getContext('2d');
      const lastTotal = -100;
      const itemArray = Array.from(this.mainSolarInfo.relativeMap.values());
      const items = Array.from(this.mainSolarInfo.relativeMap.values())
        .filter(x => x.Date.isAfter(this.mainSolarInfo.currentSolarInfo.Date))
        .map((x, index) => {

          const previous = itemArray[index + 1];
          const diff = x.getSolarTotal().subtract(previous.getSolarTotal());
          const date = x.Date.format('MMM Do YYYY');
          const solarTotal = x.getSolarTotal();
          const minutes: number = +solarTotal.asMinutes().toFixed(0);
          const seconds: number = +solarTotal.asSeconds().toFixed(0);
          const h = x.getSolarTotal().hours();
          const color = h < 12 ? 'rgba(134, 136, 255, 1)' : 'rgba(213, 144, 125, 1)';
          const sunset = x.Sunset;
          const sunrise = x.Sunrise;
          return {
            date,
            seconds,
            diff,
            color,
            sunrise,
            sunset
          } as ChartModel;
        });

      this.chartItems = items;
      return;

    }

  }

}
