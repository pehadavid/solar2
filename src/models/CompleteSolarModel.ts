import {SolarInfo} from './SolarInfo';
import {Duration, Moment} from 'moment';
import * as moment from 'moment';


export class CompleteSolarModel {
  currentSolarInfo: SolarInfo;
  relativeMap: Map<Moment, SolarInfo>;
  isNight: boolean;
  constructor(latitude: number, longitude: number) {

    const currentDate = moment().utc();
    this.relativeMap = new Map<Moment, SolarInfo>();
    this.currentSolarInfo = new SolarInfo(latitude, longitude, currentDate);
    const nextYear = currentDate.clone().add(1, 'year');
    let iterationDate = currentDate.clone().add(-2, 'day');
    while (iterationDate.year() !== nextYear.year() || iterationDate.month() !== nextYear.month()
    || iterationDate.day() !== currentDate.day()) {
      iterationDate = iterationDate.clone().add(1, 'day');
      const dayInfo = new SolarInfo(latitude, longitude, iterationDate);
      this.relativeMap.set(iterationDate, dayInfo);
    }

   this.isNight = currentDate.isAfter(this.currentSolarInfo.Sunrise) && currentDate.isBefore(this.currentSolarInfo.Sunset);

  }

  public getDiff(): Duration {

    const yesterday = this.currentSolarInfo.Date.clone().add(-1, 'day');
    let duration: Duration = null;

    this.relativeMap.forEach((k, v) => {

      if (k.Date.date() === yesterday.date() && k.Date.month() == yesterday.month() && k.Date.year() == yesterday.year()) {
        duration = this.currentSolarInfo.getSolarTotal().subtract(k.getSolarTotal());
      }
    });

    if (duration) {
      return duration;
    } else {
      return moment.duration();
    }
  }

  public getSign(): string {
    const duration = this.getDiff();
    return duration.asSeconds() < 0 ? '-' : '+';

  }

  public getNextSame(): Moment {
    const currentDuration = this.currentSolarInfo.getSolarTotal();
    const nextMoment = Array.from(this.relativeMap
      .values())
      .find(x => x.getSolarTotal().hours() === currentDuration.hours()
        && x.getSolarTotal().minutes() >= currentDuration.minutes()
        && x.Date.isAfter(this.currentSolarInfo.Date));
    return nextMoment.Date;
  }



  public getDurationToNext(): Duration {
    const next = this.getNextSame();
    return moment.duration(next.diff(this.currentSolarInfo.Date));

  }




}
