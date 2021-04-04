var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
export class TimeSpan {
    constructor(...args) {
        let millis = 0;
        let days;
        let hours;
        let minutes;
        let seconds;
        let milliseconds;
        switch ((args || []).length) {
            case 1:
                millis = int(args[0]);
                break;
            case 3:
                hours = int(args[0]);
                minutes = int(args[1]);
                seconds = int(args[2]);
                millis = TimeSpan.TimeToMillis(hours, minutes, seconds);
                break;
            case 4:
            case 5:
                days = int(args[0]);
                hours = int(args[1]);
                minutes = int(args[2]);
                seconds = int(args[3]);
                milliseconds = int(args[4] || 0);
                const num = (days * 3600 * 24 + hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
                if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
                    throw new Error(`Overflow_TimeSpanTooLong`);
                }
                millis = num * 1;
                break;
        }
        this._millis = millis;
    }
    get Days() {
        return divide(this._millis, 86400000);
    }
    get Hours() {
        return divide(this._millis, 3600000) % 24;
    }
    get Milliseconds() {
        return divide(this._millis, 1) % 1000;
    }
    get Minutes() {
        return divide(this._millis, 60000) % 60;
    }
    get Seconds() {
        return divide(this._millis, 1000) % 60;
    }
    get TotalDays() {
        return this._millis / 86400000.0;
    }
    get TotalHours() {
        return this._millis / 3600000.0;
    }
    get TotalMilliseconds() {
        const num = this._millis;
        if (num > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (num < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return num;
    }
    get TotalMinutes() {
        return this._millis / 60000.0;
    }
    get TotalSeconds() {
        return this._millis / 1000.0;
    }
    Add(ts) {
        const num = this._millis + ts._millis;
        return new TimeSpan(num);
    }
    static Compare(t1, t2) {
        if (t1._millis > t2._millis) {
            return 1;
        }
        if (t1._millis < t2._millis) {
            return -1;
        }
        return 0;
    }
    CompareTo(value) {
        const millis = value._millis;
        if (this._millis > millis) {
            return 1;
        }
        if (this._millis < millis) {
            return -1;
        }
        return 0;
    }
    static FromDays(value) {
        return TimeSpan.Interval(value, 86400000.0);
    }
    Duration() {
        if (this._millis === TimeSpan.MinValue._millis) {
            throw new Error(`Overflow_Duration`);
        }
        return new TimeSpan((this._millis >= 0) ? this._millis : (-this._millis));
    }
    Equals(obj) {
        return this._millis === obj._millis;
    }
    GetHashCode() {
        return int(this._millis) ^ int(this._millis >> 32);
    }
    static FromHours(value) {
        return TimeSpan.Interval(value, 3600000.0);
    }
    static Interval(value, scale) {
        if (Number.isNaN(value)) {
            throw new Error(`Arg_CannotBeNaN`);
        }
        const num = value * scale;
        return new TimeSpan(num);
    }
    static FromMilliseconds(value) {
        return TimeSpan.Interval(value, 1.0);
    }
    static FromMinutes(value) {
        return TimeSpan.Interval(value, 60000.0);
    }
    Negate() {
        if (this._millis === TimeSpan.MinValue._millis) {
            throw new Error(`Overflow_NegateTwosCompNum`);
        }
        return new TimeSpan(-this._millis);
    }
    static FromSeconds(value) {
        return TimeSpan.Interval(value, 1000.0);
    }
    Subtract(ts) {
        const num = this._millis - ts._millis;
        return new TimeSpan(num);
    }
    Multiply(factor) {
        if (Number.isNaN(factor)) {
            throw new Error(`"factor" Arg_CannotBeNaN`);
        }
        const num = Math.round(this._millis * factor);
        return TimeSpan.FromMillis(num);
    }
    Divide(divisor) {
        if (Number.isNaN(divisor)) {
            throw new Error(`"divisor" Arg_CannotBeNaN`);
        }
        const num = Math.round(this._millis / divisor);
        if (Number.isNaN(num)) {
            throw new Error(`Overflow_TimeSpanTooLong`);
        }
        return TimeSpan.FromMillis(num);
    }
    static FromMillis(value) {
        return new TimeSpan(value);
    }
    static TimeToMillis(hour, minute, second) {
        const num = hour * 3600 + minute * 60 + second;
        return num * 1000;
    }
    ToString(format = 'c', culture = 'en') {
        const days = Math.abs(this.Days);
        const hours = Math.abs(this.Hours);
        const minutes = Math.abs(this.Minutes);
        const seconds = Math.abs(this.Seconds);
        const milliseconds = Math.abs(this.Milliseconds);
        const dest = new Array();
        if (this.TotalMilliseconds < 0) {
            dest.push('-');
        }
        if (days !== 0) {
            dest.push(days.toString());
            dest.push(culture === 'cn' ? '天' : (format === 'c' ? '.' : ':'));
        }
        if (format !== 'g') {
            dest.push(hours.toString().padStart(2, '0'));
        }
        else {
            dest.push(hours.toString());
        }
        dest.push(culture === 'cn' ? '时' : ':');
        dest.push(minutes.toString().padStart(2, '0'));
        dest.push(culture === 'cn' ? '分' : ':');
        dest.push(seconds.toString().padStart(2, '0'));
        dest.push(culture === 'cn' ? '秒' : '');
        if (milliseconds !== 0) {
            if (culture === 'cn') {
                dest.push(milliseconds.toString().padStart(3, '0'));
                dest.push('毫秒');
            }
            else {
                dest.push('.');
                dest.push(milliseconds.toString().padStart(3, '0'));
            }
        }
        return dest.join('');
    }
    Test_TimeSpan_format_10s() {
        const format_10s = (max, min) => {
            let span = new TimeSpan(max - min);
            if (Math.abs(span.TotalMilliseconds) > new TimeSpan(0, 0, 0, 10).TotalMilliseconds) {
                span = new TimeSpan(0, 0, 0, 0, span.TotalMilliseconds - span.Milliseconds);
            }
            return span.ToString('c', 'cn');
        };
        AreEqual('1天00时00分00秒', format_10s(1593619200000, 1593532800000));
        AreEqual('00时00分22秒', format_10s(1593546359541, 1593546337366));
        AreEqual('00时00分09秒202毫秒', format_10s(1593546354745, 1593546345543));
    }
    Test_TimeSpan_ctor() {
        AreEqual(15 * 24 * 3600 * 1000, new TimeSpan(15, 0, 0, 0).TotalMilliseconds);
        AreEqual(10 * 1000, new TimeSpan(0, 0, 10).TotalMilliseconds);
    }
}
TimeSpan.Zero = new TimeSpan(0);
TimeSpan.MaxValue = new TimeSpan(Number.MAX_SAFE_INTEGER);
TimeSpan.MinValue = new TimeSpan(Number.MIN_SAFE_INTEGER);
__decorate([
    TestMethod
], TimeSpan.prototype, "Test_TimeSpan_format_10s", null);
__decorate([
    TestMethod
], TimeSpan.prototype, "Test_TimeSpan_ctor", null);
export var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
    DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
    DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
    DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
    DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
    DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
    DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
})(DayOfWeek || (DayOfWeek = {}));
export class DateTime {
    constructor(...args) {
        let millis = 0;
        let year;
        let month;
        let day;
        let hour;
        let minute;
        let second;
        let millisecond;
        switch ((args || []).length) {
            case 1:
                millis = int(args[0]);
                break;
            case 3:
                year = int(args[0]);
                month = int(args[1]);
                day = int(args[2]);
                millis = int(DateTime.DateToMillis(year, month, day));
                break;
            case 6:
                year = int(args[0]);
                month = int(args[1]);
                day = int(args[2]);
                hour = int(args[3]);
                minute = int(args[4]);
                second = int(args[5]);
                millis = int(DateTime.DateToMillis(year, month, day) + DateTime.TimeToMillis(hour, minute, second));
                break;
            case 7:
                year = int(args[0]);
                month = int(args[1]);
                day = int(args[2]);
                hour = int(args[3]);
                minute = int(args[4]);
                second = int(args[5]);
                millisecond = int(args[6]);
                if (millisecond < 0 || millisecond >= 1000) {
                    throw new Error(`ArgumentOutOfRange_Range "millisecond: [0, 999]"`);
                }
                const num = DateTime.DateToMillis(year, month, day) + DateTime.TimeToMillis(hour, minute, second);
                millis = num + millisecond * 1;
                break;
        }
        this._millis = millis;
    }
    get Date() {
        return new DateTime(this.Year, this.Month, this.Day);
    }
    get Day() {
        return this.GetDatePart(3);
    }
    get DayOfWeek() {
        return (divide(this._millis, 86400000) + 1) % 7;
    }
    get DayOfYear() {
        return this.GetDatePart(1);
    }
    get Hour() {
        return this.TimeOfDay.Hours;
    }
    get Millisecond() {
        return this._millis % 1000;
    }
    get Minute() {
        return this.TimeOfDay.Minutes;
    }
    get Month() {
        return this.GetDatePart(2);
    }
    static get Now() {
        return DateTime.FromJavaScriptDate(new Date());
    }
    get Second() {
        return this.TimeOfDay.Seconds;
    }
    get TimeOfDay() {
        return new TimeSpan(this._millis - this.Date._millis);
    }
    static get Today() {
        return DateTime.Now.Date;
    }
    get Year() {
        return this.GetDatePart(0);
    }
    static get UtcNow() {
        const d = new Date();
        return new DateTime(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    }
    Add(value) {
        return this.AddMillis(value.TotalMilliseconds);
    }
    add(value, scale) {
        const num = value * scale;
        if (num <= -315537897600000.0 || num >= 315537897600000.0) {
            throw new Error(`ArgumentOutOfRange_AddValue "value"`);
        }
        return this.AddMillis(num * 1);
    }
    AddDays(value) {
        return this.add(value, 86400000);
    }
    AddHours(value) {
        return this.add(value, 3600000);
    }
    AddMilliseconds(value) {
        return this.add(value, 1);
    }
    AddMinutes(value) {
        return this.add(value, 60000);
    }
    AddMonths(months) {
        if (months < -120000 || months > 120000) {
            throw new Error(`ArgumentOutOfRange_DateTimeBadMonths "months"`);
        }
        let { year, month, day } = this.GetDatePart2();
        let num = month - 1 + months;
        if (num >= 0) {
            month = num % 12 + 1;
            year += divide(num, 12);
        }
        else {
            month = 12 + (num + 1) % 12;
            year += divide(num - 11, 12);
        }
        if (year < 1 || year > 9999) {
            throw new Error(`ArgumentOutOfRange_DateArithmetic "months"`);
        }
        let num2 = DateTime.DaysInMonth(year, month);
        if (day > num2) {
            day = num2;
        }
        return new DateTime(int(DateTime.DateToMillis(year, month, day) + this._millis % 86400000));
    }
    AddSeconds(value) {
        return this.add(value, 1000);
    }
    AddMillis(value) {
        const internalMillis = this._millis;
        return new DateTime(int(internalMillis + value));
    }
    AddYears(value) {
        if (value < -10000 || value > 10000) {
            throw new Error(`ArgumentOutOfRange_DateTimeBadYears "years"`);
        }
        return this.AddMonths(value * 12);
    }
    static Compare(t1, t2) {
        const internalMillis = t1._millis;
        const internalMillis2 = t2._millis;
        if (internalMillis > internalMillis2) {
            return 1;
        }
        if (internalMillis < internalMillis2) {
            return -1;
        }
        return 0;
    }
    CompareTo(value) {
        return DateTime.Compare(this, value);
    }
    static DateToMillis(year, month, day) {
        if (year >= 1 && year <= 9999 && month >= 1 && month <= 12) {
            const array = DateTime.IsLeapYear(year) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
            if (day >= 1 && day <= array[month] - array[month - 1]) {
                const num = year - 1;
                const num2 = num * 365 + divide(num, 4) - divide(num, 100) + divide(num, 400) + array[month - 1] + day - 1;
                return num2 * 86400000;
            }
        }
        throw new Error(`ArgumentOutOfRange_BadYearMonthDay`);
    }
    static TimeToMillis(hour, minute, second) {
        if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60 && second >= 0 && second < 60) {
            return TimeSpan.TimeToMillis(hour, minute, second);
        }
        throw new Error(`ArgumentOutOfRange_BadHourMinuteSecond`);
    }
    static DaysInMonth(year, month) {
        if (month < 1 || month > 12) {
            throw new Error(`ArgumentOutOfRange_Month "month"`);
        }
        const array = DateTime.IsLeapYear(year) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
        return array[month] - array[month - 1];
    }
    Equals(value) {
        return this._millis == value._millis;
    }
    GetDatePart(part) {
        const internalMillis = this._millis;
        let num = divide(internalMillis, 86400000);
        let num2 = divide(num, 146097);
        num -= num2 * 146097;
        let num3 = divide(num, 36524);
        if (num3 == 4) {
            num3 = 3;
        }
        num -= num3 * 36524;
        let num4 = divide(num, 1461);
        num -= num4 * 1461;
        let num5 = divide(num, 365);
        if (num5 == 4) {
            num5 = 3;
        }
        if (part == 0) {
            return num2 * 400 + num3 * 100 + num4 * 4 + num5 + 1;
        }
        num -= num5 * 365;
        if (part == 1) {
            return num + 1;
        }
        const array = (num5 == 3 && (num4 != 24 || num3 == 3)) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
        let i;
        for (i = (num >> 5) + 1; num >= array[i]; i++) {
        }
        if (part == 2) {
            return i;
        }
        return num - array[i - 1] + 1;
    }
    GetDatePart2() {
        const internalMillis = this._millis;
        let num = divide(internalMillis, 86400000);
        let num2 = divide(num, 146097);
        num -= num2 * 146097;
        let num3 = divide(num, 36524);
        if (num3 == 4) {
            num3 = 3;
        }
        num -= num3 * 36524;
        let num4 = divide(num, 1461);
        num -= num4 * 1461;
        let num5 = divide(num, 365);
        if (num5 == 4) {
            num5 = 3;
        }
        let year = num2 * 400 + num3 * 100 + num4 * 4 + num5 + 1;
        num -= num5 * 365;
        const array = (num5 == 3 && (num4 != 24 || num3 == 3)) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
        let i;
        for (i = (num >> 5) + 1; num >= array[i]; i++) {
        }
        let month = i;
        let day = num - array[i - 1] + 1;
        return { year, month, day };
    }
    GetHashCode() {
        const internalMillis = this._millis;
        return int(internalMillis) ^ int(internalMillis >> 32);
    }
    static IsLeapYear(year) {
        if (year < 1 || year > 9999) {
            throw new Error(`ArgumentOutOfRange_Year "year"`);
        }
        if (year % 4 == 0) {
            if (year % 100 == 0) {
                return year % 400 == 0;
            }
            return true;
        }
        return false;
    }
    Subtract(value) {
        return new TimeSpan(this._millis - value._millis);
    }
    ToString(format = 'yyyy-MM-dd HH:mm:ss') {
        const data = {};
        data['yyyy'] = this.Year.toString().padStart(4, '0');
        data['MM'] = this.Month.toString().padStart(2, '0');
        data['M'] = this.Month.toString();
        data['dd'] = this.Day.toString().padStart(2, '0');
        data['d'] = this.Day.toString();
        data['HH'] = this.Hour.toString().padStart(2, '0');
        data['H'] = this.Hour.toString();
        data['mm'] = this.Minute.toString().padStart(2, '0');
        data['m'] = this.Minute.toString();
        data['ss'] = this.Second.toString().padStart(2, '0');
        data['s'] = this.Second.toString();
        data['fff'] = this.Millisecond.toString().padStart(3, '0');
        data['ff'] = data['fff'].substr(0, 2);
        let output = '';
        const parts = format.split(/(yyyy|MM|M|dd|d|HH|H|mm|m|ss|s|fff|ff)?/);
        for (let index = 0; index < parts.length; index++) {
            const item = parts[index];
            output += data[item] != null ? data[item] : item;
        }
        return output;
    }
    static FromUTCTimeStamp(timestamp) {
        return DateTime.FromJSTimestamp(timestamp * 1000);
    }
    static FromJSTimestamp(timestamp) {
        return DateTime.FromJavaScriptDate(new Date(timestamp));
    }
    static FromJavaScriptDate(date) {
        const d = date;
        return new DateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    ToJavaScriptTimestamp() {
        return this.ToJavaScriptDate().valueOf();
    }
    ToJavaScriptDate() {
        return new Date(this.Year, this.Month - 1, this.Day, this.Hour, this.Minute, this.Second, this.Millisecond);
    }
    ToJSONString() {
        return JSON.stringify(this);
    }
    static FromJSONString(value) {
        let result = JSON.parse(value);
        return new DateTime(result._millis);
    }
    Test_DateTime_AddMilliseconds() {
        let min1 = new DateTime(2020, 7, 1);
        let max1 = new DateTime(2020, 7, 2);
        let span = max1.Subtract(min1);
        AreEqual('2020-06-30 00:00:00', min1.AddMilliseconds(-span.TotalMilliseconds).ToString());
        AreEqual('1.00:00:00', span.ToString());
        AreEqual('2020-07-01 00:00:00', min1.ToString());
    }
    Test_DateTime_Divide() {
        let min1 = new DateTime(2020, 7, 1);
        let max1 = new DateTime(2020, 7, 2);
        let span = max1.Subtract(min1);
        AreEqual('1.00:00:00', span.Divide(1).ToString());
        AreEqual('12:00:00', span.Divide(2).ToString());
        AreEqual('08:00:00', span.Divide(3).ToString());
        AreEqual('06:00:00', span.Divide(4).ToString());
        AreEqual('04:48:00', span.Divide(5).ToString());
        AreEqual('03:25:42.857', span.Divide(7).ToString());
        AreEqual('02:40:00', span.Divide(9).ToString());
        AreEqual('02:10:54.545', span.Divide(11).ToString());
        AreEqual('01:50:46.154', span.Divide(13).ToString());
    }
    Test_TimeSpan_Creators() {
        let oneMilliseconds = TimeSpan.FromMilliseconds(1);
        let oneMillis = TimeSpan.FromMillis(1);
        let oneMinutes = TimeSpan.FromMinutes(1);
        let oneHours = TimeSpan.FromHours(1);
        let oneDays = TimeSpan.FromDays(1);
        let oneSeconds = TimeSpan.FromSeconds(1);
        AreEqual(oneMilliseconds.TotalMilliseconds, 1);
        AreEqual(oneMillis.TotalMilliseconds, 1);
        AreEqual(oneMinutes.TotalMinutes, 1);
        AreEqual(oneHours.TotalHours, 1);
        AreEqual(oneDays.TotalDays, 1);
        AreEqual(oneSeconds.TotalSeconds, 1);
    }
}
DateTime.s_daysToMonth365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
DateTime.s_daysToMonth366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
DateTime.MinValue = new DateTime(0);
DateTime.MaxValue = new DateTime(Number.MAX_SAFE_INTEGER);
DateTime.UnixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, 0);
__decorate([
    TestMethod
], DateTime.prototype, "Test_DateTime_AddMilliseconds", null);
__decorate([
    TestMethod
], DateTime.prototype, "Test_DateTime_Divide", null);
__decorate([
    TestMethod
], DateTime.prototype, "Test_TimeSpan_Creators", null);
export function TestMethod(target, propertyKey, descriptor) {
    try {
        descriptor.value();
        console.info('%c ✔', 'color: green', `UnitTest '${propertyKey.toString()}' passed!`);
    }
    catch (ex) {
        console.error('%c ❌', 'color: red', `UnitTest '${propertyKey.toString()}' faild!`, '\n', ex);
    }
}
export function AreEqual(expected, actual) {
    let equal = true;
    if (null == expected) {
        if (null != actual && actual !== expected) {
            equal = false;
        }
    }
    else if (expected !== actual) {
        equal = false;
    }
    if (!equal) {
        throw new Error('expected = ' + expected + ', ' + 'actual = ' + actual);
    }
}
;
export function divide(value, factor) {
    return int(+value / +factor);
}
export function int(value) {
    return +value >= 0 ? Math.floor(+value) : Math.ceil(+value);
}
window['DateTime'] = DateTime;
window['TimeSpan'] = TimeSpan;
//# sourceMappingURL=datetime.js.map