let instance: Time;

//Format Example: 2019/9/22|10:12:23|GMT...

export interface TimeInfo {
    year: number;
    month: number;
    date: number;

    hour: number;
    minute: number;
    second: number;

    region: string;
}

export class Time {

    private date: Date;
    private Separater: string;

    private constructor() {
        this.date = new Date();
        this.Separater = '|';
    }

    static GetInstance(): Time {
        if (instance) {
            return instance;
        }
        instance = new Time();
        return instance;
    }

    GetTimeStamp(): string {
        this.date.setTime(Date.now());
        let dateStr = this.GetDateString();
        let tList = this.date.toTimeString().split(' ');
        dateStr += this.Separater + tList[0] + this.Separater + tList[1];
        return dateStr;
    }

    private GetDateString(): string {
        return this.date.getFullYear().toString() + '/' + (this.date.getMonth() + 1).toString() + '/' + this.date.getDate().toString();
    }

    GetTimeInfo(): TimeInfo {

        this.date.setTime(Date.now());

        return {
            year: this.date.getFullYear(),
            month: this.date.getMonth(),
            date: this.date.getDate(),

            hour: this.date.getHours(),
            minute: this.date.getMinutes(),
            second: this.date.getSeconds(),

            region: this.date.toTimeString().split(' ')[1]
        };
    }

    Parse(timeStamp: string): TimeInfo {

        let fieldList = timeStamp.split('|');
        let yearField = fieldList[0].split('/');
        let timeField = fieldList[1].split(':');

        return {
            year: Number.parseInt(yearField[0]),
            month: Number.parseInt(yearField[1]),
            date: Number.parseInt(yearField[2]),

            hour: Number.parseInt(timeField[0]),
            minute: Number.parseInt(timeField[1]),
            second: Number.parseInt(timeField[2]),

            region: fieldList[2]
        };
    }

    Stringify(timeData: TimeInfo): string {
        return timeData.year.toString() + '/' + timeData.month.toString() + '/' + timeData.date.toString() + '|'
            + timeData.hour.toString() + ':' + timeData.minute.toString() + ':' + timeData.second.toString() + '|'
            + timeData.region;
    }

    SetTimeSeparater(sep: string) {
        this.Separater = sep;
    }

    GetTimeSeparater(): string {
        return this.Separater;
    }
}