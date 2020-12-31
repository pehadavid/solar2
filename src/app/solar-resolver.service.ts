import {EventEmitter, Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {SolarInfo} from '../models/SolarInfo';
import * as moment from 'moment';
import {Moment} from 'moment';
import {CompleteSolarModel} from '../models/CompleteSolarModel';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {interval, timer} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolarResolverService {

  completeModel: CompleteSolarModel;
  onMainSolarInfoUpdated: EventEmitter<CompleteSolarModel>;
  currentDate: Moment;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.currentDate = moment();
    this.onMainSolarInfoUpdated = new EventEmitter<CompleteSolarModel>();
    let done = false;
    if (isPlatformBrowser(this.platformId)) {
      if (navigator) {
        if ('geolocation' in navigator) {
          const itv = timer(1, 60000);
          itv.subscribe( r => {
            const now = moment();
            if (now.isAfter(this.currentDate, 'day') || r === 0) {
              done = true;
              this.brModel();
            }
          });


        }
      }
    }

    if (!done){
      this.ssrModel();
    }
   

  }

  private brModel() {
    navigator.geolocation.getCurrentPosition(position => {
      this.currentDate = moment();
      //  this.solarInfo = new SolarInfo(position.coords.latitude, position.coords.longitude, this.currentDate);
      this.completeModel = new CompleteSolarModel(position.coords.latitude, position.coords.longitude);
      this.onMainSolarInfoUpdated.emit(this.completeModel);
    });
  }

  private ssrModel() {
      const longitude = 48.846204;
      const latitude = 2.349543;
      this.completeModel = new CompleteSolarModel(latitude, longitude);
      this.onMainSolarInfoUpdated.emit(this.completeModel);
  }
}
