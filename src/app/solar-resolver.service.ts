import {EventEmitter, Injectable} from '@angular/core';
import {SolarInfo} from '../models/SolarInfo';
import * as moment from 'moment';
import {Moment} from 'moment';
import {CompleteSolarModel} from '../models/CompleteSolarModel';

@Injectable({
  providedIn: 'root'
})
export class SolarResolverService {

  completeModel: CompleteSolarModel;
  onMainSolarInfoUpdated: EventEmitter<CompleteSolarModel>;
  currentDate: Moment;

  constructor() {
    this.currentDate = moment();
    this.onMainSolarInfoUpdated = new EventEmitter<CompleteSolarModel>();
    if (navigator) {
      if ('geolocation' in navigator) {
        const self = this;
        self.brModel();
        setInterval(() => {
          const now = moment();
          if (now.isAfter(self.currentDate, 'day')) {
            self.brModel();
          }
        }, 60000);

      }
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
}
