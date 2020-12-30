import { Pipe, PipeTransform } from '@angular/core';
import {Duration, Moment} from 'moment';

@Pipe({
  name: 'fineDuration'
})
export class FineDurationPipe implements PipeTransform {

  transform(value: Duration, args?: any): string {
    return `${value.minutes()}min. ${value.seconds()}sec.`;
  }

}
