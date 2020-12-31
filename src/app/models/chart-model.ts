import { Duration, Moment } from "moment";

export class ChartModel {
   public date:string;
   public minutes: number;
   public diff: Duration;
   public color: string;
   public sunrise: Moment;
   public sunset: Moment;

}
