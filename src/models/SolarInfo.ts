import {Duration, Moment} from 'moment';
import * as moment from 'moment';


export class SolarInfo {
  public SolarDeclination: number;
  public EquationOfTime: Duration; // c# -> TimeSpan
  public Sunrise: Moment;
  public Sunset: Moment;
  public Noon: Duration | null;
  public Date: Moment;

  public Latitude: number;
  public Longitude: number;


  constructor(latitude: number, longitude: number, date: Moment) {
    date = date.utc();
    date.hour(0);
    date.minute(0);
    date.second(0);

    this.Latitude = latitude;
    this.Longitude = longitude;
    this.Date = date;
    const year = date.year();
    const month = date.month() + 1;
    const day = date.date();

    if ((latitude >= -90) && (latitude < -89)) {
      latitude = -89;
    }

    if ((latitude <= 90) && (latitude > 89)) {
      latitude = 89;
    }

    const JD = this.calcJD(year, month, day);
    const doy = this.calcDayOfYear(month, day, this.isLeapYear(year));
    const T = this.calcTimeJulianCent(JD);

    let solarDec = this.calcSunDeclination(T);
    let eqTime = this.calcEquationOfTime(T); // (in minutes)

    // Calculate sunrise for this date
    // if no sunrise is found, set flag nosunrise
    let nosunrise = false;

    const riseTimeGMT = this.calcSunriseUTC(JD, latitude, longitude);
    nosunrise = !this.isNumber(riseTimeGMT);

    // Calculate sunset for this date
    // if no sunset is found, set flag nosunset
    let nosunset = false;
    const setTimeGMT = this.calcSunsetUTC(JD, latitude, longitude);
    if (!this.isNumber(setTimeGMT)) {
      nosunset = true;
    }
    if (!nosunrise) {
      // this.Sunrise = date.Date.AddMinutes(riseTimeGMT);
      this.Sunrise = date.clone().add(riseTimeGMT, 'minute');
    }

    if (!nosunset) {
      // this.Sunset = date.AddMinutes(setTimeGMT);
      this.Sunset = date.clone().add(setTimeGMT, 'minute');
    }

    // Calculate solar noon for this date
    const solNoonGMT = this.calcSolNoonUTC(T, longitude);

    if (!(nosunset || nosunrise)) {
      // this.Noon = TimeSpan.FromMinutes(solNoonGMT);
      this.Noon = moment.duration(solNoonGMT, 'minutes');
    }
    const tsnoon = this.calcTimeJulianCent(this.calcJDFromJulianCent(T) - 0.5 + solNoonGMT / 1440.0);
    eqTime = this.calcEquationOfTime(tsnoon);
    solarDec = this.calcSunDeclination(tsnoon);

    this.EquationOfTime = moment.duration(eqTime, 'minutes');
    this.SolarDeclination = solarDec;

    // report special cases of no sunrise
    if (nosunrise) {
      // if Northern hemisphere and spring or summer, OR
      // if Southern hemisphere and fall or winter, use
      // previous sunrise and next sunset

      if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
        ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) {
        let newjd = this.findRecentSunrise(JD, latitude, longitude);
        let newtime = this.calcSunriseUTC(newjd, latitude, longitude);

        if (newtime > 1440) {
          newtime -= 1440;
          newjd += 1.0;
        }
        if (newtime < 0) {
          newtime += 1440;
          newjd -= 1.0;
        }

        this.Sunrise = this.ConvertToDate(newtime, newjd);
      } else if (((latitude > 66.4) && ((doy < 83) || (doy > 263))) ||
        ((latitude < -66.4) && (doy > 79) && (doy < 267))) {
        let newjd = this.findNextSunrise(JD, latitude, longitude);
        let newtime = this.calcSunriseUTC(newjd, latitude, longitude);

        if (newtime > 1440) {
          newtime -= 1440;
          newjd += 1.0;
        }
        if (newtime < 0) {
          newtime += 1440;
          newjd -= 1.0;
        }

        this.Sunrise = this.ConvertToDate(newtime, newjd);
      } else {
        throw new Error('Cannot Find Sunrise!');
      }

      // alert("Last Sunrise was on day " + findRecentSunrise(JD, latitude, longitude));
      // alert("Next Sunrise will be on day " + findNextSunrise(JD, latitude, longitude));
    }
    if (nosunset) {
      // if Northern hemisphere and spring or summer, OR
      // if Southern hemisphere and fall or winter, use
      // previous sunrise and next sunset

      if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
        ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) {
        let newjd = this.findNextSunset(JD, latitude, longitude);
        let newtime = this.calcSunsetUTC(newjd, latitude, longitude);

        if (newtime > 1440) {
          newtime -= 1440;
          newjd += 1.0;
        }
        if (newtime < 0) {
          newtime += 1440;
          newjd -= 1.0;
        }

        this.Sunset = this.ConvertToDate(newtime, newjd);
      } else if (((latitude > 66.4) && ((doy < 83) || (doy > 263))) ||
        ((latitude < -66.4) && (doy > 79) && (doy < 267))) {
        let newjd = this.findRecentSunset(JD, latitude, longitude);
        let newtime = this.calcSunsetUTC(newjd, latitude, longitude);

        if (newtime > 1440) {
          newtime -= 1440;
          newjd += 1.0;
        }
        if (newtime < 0) {
          newtime += 1440;
          newjd -= 1.0;
        }

        this.Sunset = this.ConvertToDate(newtime, newjd);
      } else {
        throw new Error('Cannot Find Sunset!');
      }

    }

  }

  private calcJD(year, month, day): number {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    const A = Math.floor(year / 100);

    const B = 2 - A + Math.floor(A / 4);

    const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1.0)) + day + B - 1524.5;

    return JD;
  }

  private calcDayOfYear(mn: number, dy: number, lpyr: boolean): number {
    const k = (lpyr ? 1 : 2);
    const doy = Math.floor((275 * mn) / 9) - k * Math.floor((mn + 9) / 12) + dy - 30;
    return doy;
  }

  private isLeapYear(yr): boolean {
    return ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0);
  }

  private calcTimeJulianCent(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    return T;
  }

  private calcSunDeclination(t: number): number {
    const e = this.calcObliquityCorrection(t);
    const lambda = this.calcSunApparentLong(t);

    const sint = Math.sin(this.degToRad(e)) * Math.sin(this.degToRad(lambda));
    const theta = this.radToDeg(Math.asin(sint));
    return theta;       // in degrees
  }

  private calcObliquityCorrection(t: number): number {
    const e0 = this.calcMeanObliquityOfEcliptic(t);

    const omega = 125.04 - 1934.136 * t;
    const e = e0 + 0.00256 * Math.cos(this.degToRad(omega));
    return e;       // in degrees
  }

  private calcMeanObliquityOfEcliptic(t: number): number {
    const seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
    const e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
    return e0;      // in degrees
  }

  private degToRad(angleDeg: number): number {
    return (Math.PI * angleDeg / 180.0);
  }

  private radToDeg(angleRad: number): number {
    return (180.0 * angleRad / Math.PI);
  }

  private calcSunApparentLong(t: number): number {
    const o = this.calcSunTrueLong(t);

    const omega = 125.04 - 1934.136 * t;
    const lambda = o - 0.00569 - 0.00478 * Math.sin(this.degToRad(omega));
    return lambda;      // in degrees
  }

  private calcSunTrueLong(t: number): number {
    const l0 = this.calcGeomMeanLongSun(t);
    const c = this.calcSunEqOfCenter(t);

    const O = l0 + c;
    return O;       // in degrees
  }

  private calcGeomMeanLongSun(t: number): number {
    let L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
    while (L0 > 360.0) {
      L0 -= 360.0;
    }
    while (L0 < 0.0) {
      L0 += 360.0;
    }
    return L0;      // in degrees
  }

  private calcSunEqOfCenter(t: number): number {
    const m = this.calcGeomMeanAnomalySun(t);

    const mrad = this.degToRad(m);
    const sinm = Math.sin(mrad);
    const sin2m = Math.sin(mrad + mrad);
    const sin3m = Math.sin(mrad + mrad + mrad);

    const C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
    return C;       // in degrees
  }

  private calcGeomMeanAnomalySun(t: number): number {
    const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    return M;       // in degrees
  }

  private calcEquationOfTime(t: number): number {
    const epsilon = this.calcObliquityCorrection(t);
    const l0 = this.calcGeomMeanLongSun(t);
    const e = this.calcEccentricityEarthOrbit(t);
    const m = this.calcGeomMeanAnomalySun(t);

    let y = Math.tan(this.degToRad(epsilon) / 2.0);
    y *= y;

    const sin2l0 = Math.sin(2.0 * this.degToRad(l0));
    const sinm = Math.sin(this.degToRad(m));
    const cos2l0 = Math.cos(2.0 * this.degToRad(l0));
    const sin4l0 = Math.sin(4.0 * this.degToRad(l0));
    const sin2m = Math.sin(2.0 * this.degToRad(m));

    const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0
      - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;

    return this.radToDeg(Etime) * 4.0;   // in minutes of time
  }

  private calcEccentricityEarthOrbit(t: number): number {
    const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    return e;       // unitless
  }

  private calcSunriseUTC(JD: number, latitude: number, longitude: number): number {
    const t = this.calcTimeJulianCent(JD);

    // *** Find the time of solar noon at the location, and use
    //     that declination. This is better than start of the
    //     Julian day

    const noonmin = this.calcSolNoonUTC(t, longitude);
    const tnoon = this.calcTimeJulianCent(JD + noonmin / 1440.0);

    // *** First pass to approximate sunrise (using solar noon)

    let eqTime = this.calcEquationOfTime(tnoon);
    let solarDec = this.calcSunDeclination(tnoon);
    let hourAngle = this.calcHourAngleSunrise(latitude, solarDec);

    let delta = longitude - this.radToDeg(hourAngle);
    let timeDiff = 4 * delta;   // in minutes of time
    let timeUTC = 720 + timeDiff - eqTime;  // in minutes

    // alert("eqTime = " + eqTime + "\nsolarDec = " + solarDec + "\ntimeUTC = " + timeUTC);

    // *** Second pass includes fractional jday in gamma calc

    const newt = this.calcTimeJulianCent(this.calcJDFromJulianCent(t) + timeUTC / 1440.0);
    eqTime = this.calcEquationOfTime(newt);
    solarDec = this.calcSunDeclination(newt);
    hourAngle = this.calcHourAngleSunrise(latitude, solarDec);
    delta = longitude - this.radToDeg(hourAngle);
    timeDiff = 4 * delta;
    timeUTC = 720 + timeDiff - eqTime; // in minutes

    // alert("eqTime = " + eqTime + "\nsolarDec = " + solarDec + "\ntimeUTC = " + timeUTC);

    return timeUTC;
  }


  private calcSolNoonUTC(t: number, longitude: number): number {
    // First pass uses approximate solar noon to calculate eqtime
    const tnoon = this.calcTimeJulianCent(this.calcJDFromJulianCent(t) + longitude / 360.0);
    let eqTime = this.calcEquationOfTime(tnoon);
    let solNoonUTC = 720 + (longitude * 4) - eqTime; // min

    const newt = this.calcTimeJulianCent(this.calcJDFromJulianCent(t) - 0.5 + solNoonUTC / 1440.0);

    eqTime = this.calcEquationOfTime(newt);
    // var solarNoonDec = calcSunDeclination(newt);
    solNoonUTC = 720 + (longitude * 4) - eqTime; // min

    return solNoonUTC;
  }


  private calcJDFromJulianCent(t: number): number {
    const JD = t * 36525.0 + 2451545.0;
    return JD;
  }

  private calcHourAngleSunrise(lat: number, solarDec: number): number {
    const latRad = this.degToRad(lat);
    const sdRad = this.degToRad(solarDec);

    const HAarg = (Math.cos(this.degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));
    const HA = (Math.acos(Math.cos(this.degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad)));
    return HA;      // in radians
  }

  private isNumber(inputVal: number): boolean {

    // TODO: Make sure I ported this function correctly
    return inputVal !== null && inputVal !== undefined && inputVal !== NaN;
  }

  private calcSunsetUTC(JD: number, latitude: number, longitude: number): number {
    const t = this.calcTimeJulianCent(JD);

    // *** Find the time of solar noon at the location, and use
    //     that declination. This is better than start of the
    //     Julian day

    const noonmin = this.calcSolNoonUTC(t, longitude);
    const tnoon = this.calcTimeJulianCent(JD + noonmin / 1440.0);

    // First calculates sunrise and approx length of day

    let eqTime = this.calcEquationOfTime(tnoon);
    let solarDec = this.calcSunDeclination(tnoon);
    let hourAngle = this.calcHourAngleSunset(latitude, solarDec);

    let delta = longitude - this.radToDeg(hourAngle);
    let timeDiff = 4 * delta;
    let timeUTC = 720 + timeDiff - eqTime;

    // first pass used to include fractional day in gamma calc

    const newt = this.calcTimeJulianCent(this.calcJDFromJulianCent(t) + timeUTC / 1440.0);
    eqTime = this.calcEquationOfTime(newt);
    solarDec = this.calcSunDeclination(newt);
    hourAngle = this.calcHourAngleSunset(latitude, solarDec);

    delta = longitude - this.radToDeg(hourAngle);
    timeDiff = 4 * delta;
    timeUTC = 720 + timeDiff - eqTime; // in minutes

    return timeUTC;
  }


  private calcHourAngleSunset(lat: number, solarDec: number): number {
    const latRad = this.degToRad(lat);
    const sdRad = this.degToRad(solarDec);

    const HAarg = (Math.cos(this.degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));

    const HA = (Math.acos(Math.cos(this.degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad)));

    return -HA;     // in radians
  }

  private findRecentSunrise(jd: number, latitude: number, longitude: number): number {
    let julianday = jd;

    let time = this.calcSunriseUTC(julianday, latitude, longitude);
    while (!this.isNumber(time)) {
      julianday -= 1.0;
      time = this.calcSunriseUTC(julianday, latitude, longitude);
    }

    return julianday;
  }

  private ConvertToDate(minutes: number, JD: number): Moment {
    let julianday = JD;
    const floatHour = minutes / 60.0;
    let hour = Math.floor(floatHour);
    const floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
    let minute = Math.floor(floatMinute);
    const floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
    const second = Math.floor(floatSec + 0.5);

    minute += (second >= 30) ? 1 : 0;

    if (minute >= 60) {
      minute -= 60;
      hour++;
    }

    if (hour > 23) {
      hour -= 24;
      julianday += 1.0;
    }

    if (hour < 0) {
      hour += 24;
      julianday -= 1.0;
    }

    // return this.calcDayFromJD(julianday).Add(new TimeSpan(0, hour, minute, second));
    const addDuration = moment.duration(hour, 'hour').add(minute, 'minutes').add(second, 'seconds');
    return this.calcDayFromJD(julianday).clone().add(addDuration);
  }

  private calcDayFromJD(jd: number): Moment {
    const z = Math.floor(jd + 0.5);
    const f = (jd + 0.5) - z;

    let A = 0;
    if (z < 2299161) {
      A = z;
    } else {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      A = z + 1 + alpha - Math.floor(alpha / 4);
    }

    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);

    const day = B - D - Math.floor(30.6001 * E) + f;
    const month = (E < 14) ? E - 1 : E - 13;
    const year = (month > 2) ? C - 4716 : C - 4715;

// return new DateTime((int)year, (int)month, (int)day, 0, 0, 0, DateTimeKind.Utc);

    return moment().year(year).month(month).day(day).hour(0).minute(0).second(0);
  }

  private findNextSunrise(jd: number, latitude: number, longitude: number): number {
    let julianday = jd;

    let time = this.calcSunriseUTC(julianday, latitude, longitude);
    while (!this.isNumber(time)) {
      julianday += 1.0;

      time = this.calcSunriseUTC(julianday, latitude, longitude);

    }

    return julianday;
  }

  private findNextSunset(jd: number, latitude: number, longitude: number): number {
    let julianday = jd;

    let time = this.calcSunsetUTC(julianday, latitude, longitude);
    while (!this.isNumber(time)) {
      julianday += 1.0;
      time = this.calcSunsetUTC(julianday, latitude, longitude);
    }

    return julianday;
  }

  private findRecentSunset(jd: number, latitude: number, longitude: number): number {
    let julianday = jd;

    let time = this.calcSunsetUTC(julianday, latitude, longitude);
    while (!this.isNumber(time)) {
      julianday -= 1.0;
      time = this.calcSunsetUTC(julianday, latitude, longitude);
    }

    return julianday;
  }


  public getSolarTotal(): Duration {
    return moment.duration(this.Sunset.diff(this.Sunrise));
  }

  public getHumanSolarTotal(): string {
    const duration = this.getSolarTotal();
    const  hours =  duration.hours();
    const minutes = duration.minutes();
    return `${hours}h ${minutes}min.`;
  }
}
