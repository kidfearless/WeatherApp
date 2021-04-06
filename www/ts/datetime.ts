export class TimeSpan
{
	public static readonly Zero = new TimeSpan(0);
	public static readonly MaxValue = new TimeSpan(Number.MAX_SAFE_INTEGER);
	public static readonly MinValue = new TimeSpan(Number.MIN_SAFE_INTEGER);
	private readonly _millis: number;

	public get Days()
	{
		return divide(this._millis, 86400000);
	}

	public get Hours()
	{
		return divide(this._millis, 3600000) % 24;
	}

	public get Milliseconds()
	{
		return divide(this._millis, 1) % 1000;
	}

	public get Minutes()
	{
		return divide(this._millis, 60000) % 60;
	}

	public get Seconds()
	{
		return divide(this._millis, 1000) % 60;
	}

	public get TotalDays()
	{
		return this._millis / 86400000.0;
	}

	public get TotalHours()
	{
		return this._millis / 3600000.0;
	}

	public get TotalMilliseconds()
	{
		const num = this._millis;
		if (num > Number.MAX_SAFE_INTEGER)
		{
			return Number.MAX_SAFE_INTEGER;
		}
		if (num < Number.MIN_SAFE_INTEGER)
		{
			return Number.MIN_SAFE_INTEGER;
		}
		return num;
	}

	public get TotalMinutes()
	{
		return this._millis / 60000.0;
	}

	public get TotalSeconds()
	{
		return this._millis / 1000.0;
	}

	constructor(millis: number);
	constructor(hours: number, minutes:number, seconds:number);
	constructor(days:number, hours: number, minutes:number, seconds:number, milliseconds?:number);
	constructor(...args: number[])
	{
		let millis = 0;
		let days: number;
		let hours: number;
		let minutes: number;
		let seconds: number;
		let milliseconds: number;

		switch ((args || []).length)
		{
			case 1: millis = int(args[0]); break;
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
				if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER)
				{
					throw new Error(`Overflow_TimeSpanTooLong`);
				}
				millis = num * 1;
				break;
		}
		this._millis = millis;
	}

	public Add(ts: TimeSpan): TimeSpan
	{
		const num = this._millis + ts._millis;
		return new TimeSpan(num);
	}

	public static Compare(t1: TimeSpan, t2: TimeSpan): number
	{
		if (t1._millis > t2._millis)
		{
			return 1;
		}
		if (t1._millis < t2._millis)
		{
			return -1;
		}
		return 0;
	}

	public CompareTo(value: TimeSpan): number
	{
		const millis = value._millis;
		if (this._millis > millis)
		{
			return 1;
		}
		if (this._millis < millis)
		{
			return -1;
		}
		return 0;
	}

	public static FromDays(value: number): TimeSpan
	{
		return TimeSpan.Interval(value, 86400000.0);
	}

	public Duration(): TimeSpan
	{
		if (this._millis === TimeSpan.MinValue._millis)
		{
			throw new Error(`Overflow_Duration`);
		}
		return new TimeSpan((this._millis >= 0) ? this._millis : (-this._millis));
	}

	public Equals(obj: TimeSpan): boolean
	{
		return this._millis === obj._millis;
	}

	public GetHashCode(): number
	{
		return int(this._millis) ^ int(this._millis >> 32);
	}

	public static FromHours(value: number): TimeSpan
	{
		return TimeSpan.Interval(value, 3600000.0);
	}

	private static Interval(value: number, scale: number): TimeSpan
	{
		if (Number.isNaN(value))
		{
			throw new Error(`Arg_CannotBeNaN`);
		}
		const num = value * scale;
		return new TimeSpan(num);
	}

	public static FromMilliseconds(value: number): TimeSpan
	{
		return TimeSpan.Interval(value, 1.0);
	}

	public static FromMinutes(value: number): TimeSpan
	{
		return TimeSpan.Interval(value, 60000.0);
	}

	public Negate(): TimeSpan
	{
		if (this._millis === TimeSpan.MinValue._millis)
		{
			throw new Error(`Overflow_NegateTwosCompNum`);
		}
		return new TimeSpan(-this._millis);
	}

	public static FromSeconds(value: number): TimeSpan
	{
		return TimeSpan.Interval(value, 1000.0);
	}

	public Subtract(ts: TimeSpan): TimeSpan
	{
		const num = this._millis - ts._millis;
		return new TimeSpan(num);
	}

	public Multiply(factor: number): TimeSpan
	{
		if (Number.isNaN(factor))
		{
			throw new Error(`"factor" Arg_CannotBeNaN`);
		}
		const num = Math.round(this._millis * factor);
		return TimeSpan.FromMillis(num);
	}

	public Divide(divisor: number): TimeSpan
	{
		if (Number.isNaN(divisor))
		{
			throw new Error(`"divisor" Arg_CannotBeNaN`);
		}
		const num = Math.round(this._millis / divisor);
		if (Number.isNaN(num))
		{
			throw new Error(`Overflow_TimeSpanTooLong`);
		}
		return TimeSpan.FromMillis(num);
	}

	public static FromMillis(value: number): TimeSpan
	{
		return new TimeSpan(value);
	}

	public static TimeToMillis(hour: number, minute: number, second: number): number
	{
		const num = hour * 3600 + minute * 60 + second;
		return num * 1000;
	}

	public ToString(format: 'c' | 'g' | 'G' = 'c', culture: 'en' | 'cn' = 'en'): string
	{
		const days = Math.abs(this.Days);
		const hours = Math.abs(this.Hours);
		const minutes = Math.abs(this.Minutes);
		const seconds = Math.abs(this.Seconds);
		const milliseconds = Math.abs(this.Milliseconds);

		const dest = new Array<string>();
		if (this.TotalMilliseconds < 0)
		{
			dest.push('-');
		}
		if (days !== 0)
		{
			dest.push(days.toString());
			dest.push(culture === 'cn' ? '天' : (format === 'c' ? '.' : ':'));
		}
		if (format !== 'g')
		{
			dest.push(hours.toString().padStart(2, '0'));
		} else
		{
			dest.push(hours.toString());
		}
		dest.push(culture === 'cn' ? '时' : ':');

		dest.push(minutes.toString().padStart(2, '0'));
		dest.push(culture === 'cn' ? '分' : ':');

		dest.push(seconds.toString().padStart(2, '0'));
		dest.push(culture === 'cn' ? '秒' : '');

		if (milliseconds !== 0)
		{
			if (culture === 'cn')
			{
				dest.push(milliseconds.toString().padStart(3, '0'));
				dest.push('毫秒');
			} else
			{
				dest.push('.');
				dest.push(milliseconds.toString().padStart(3, '0'));
			}
		}
		return dest.join('');
	}

	@TestMethod
	//@ts-ignore
	public Test_TimeSpan_format_10s()
	{
		const format_10s = (max: number, min: number) =>
		{
			let span = new TimeSpan(max - min);
			if (Math.abs(span.TotalMilliseconds) > new TimeSpan(0, 0, 0, 10).TotalMilliseconds)
			{
				span = new TimeSpan(0, 0, 0, 0, span.TotalMilliseconds - span.Milliseconds);
			}
			return span.ToString('c', 'cn');
		};
		AreEqual('1天00时00分00秒', format_10s(1593619200000, 1593532800000));
		AreEqual('00时00分22秒', format_10s(1593546359541, 1593546337366));
		AreEqual('00时00分09秒202毫秒', format_10s(1593546354745, 1593546345543));
	}

	@TestMethod
	//@ts-ignore
	public Test_TimeSpan_ctor()
	{
		AreEqual(15 * 24 * 3600 * 1000, new TimeSpan(15, 0, 0, 0).TotalMilliseconds);//15days
		AreEqual(10 * 1000, new TimeSpan(0, 0, 10).TotalMilliseconds); //10s
	}
}

export enum DayOfWeek
{
	Sunday,
	Monday,
	Tuesday,
	Wednesday,
	Thursday,
	Friday,
	Saturday
}

export class DateTime
{
	private static readonly s_daysToMonth365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
	private static readonly s_daysToMonth366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

	public static readonly MinValue = new DateTime(0);
	public static readonly MaxValue = new DateTime(Number.MAX_SAFE_INTEGER);
	public static readonly UnixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, 0);

	private readonly _millis: number;

	public get Date(): DateTime
	{
		return new DateTime(this.Year, this.Month, this.Day);
	}

	public get Day(): number
	{
		return this.GetDatePart(3);
	}

	public get DayOfWeek(): DayOfWeek
	{
		return (divide(this._millis, 86400000) + 1) % 7;
	}

	public get DayOfYear(): number
	{
		return this.GetDatePart(1);
	}

	public get Hour(): number
	{
		return this.TimeOfDay.Hours;
	}

	public get Millisecond(): number
	{
		return this._millis % 1000;
	}

	public get Minute(): number
	{
		return this.TimeOfDay.Minutes;
	}

	public get Month(): number
	{
		return this.GetDatePart(2);
	}

	public static get Now(): DateTime
	{
		return DateTime.FromJavaScriptDate(new Date());
	}

	public get Second(): number
	{
		return this.TimeOfDay.Seconds;
	}

	public get TimeOfDay(): TimeSpan
	{
		return new TimeSpan(this._millis - this.Date._millis);
	}

	public static get Today(): DateTime
	{
		return DateTime.Now.Date;
	}

	public get Year(): number
	{
		return this.GetDatePart(0);
	}

	public static get UtcNow(): DateTime
	{
		const d = new Date();
		return new DateTime(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
	}

	constructor(milliseconds: number);
	constructor(year: number, month: number, day: number);
	constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
	constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number);
	constructor(...args: number[])
	{
		let millis = 0;
		let year: number;
		let month: number;
		let day: number;
		let hour: number;
		let minute: number;
		let second: number;
		let millisecond: number;

		switch ((args || []).length)
		{
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
				if (millisecond < 0 || millisecond >= 1000)
				{
					throw new Error(`ArgumentOutOfRange_Range "millisecond: [0, 999]"`);
				}
				const num = DateTime.DateToMillis(year, month, day) + DateTime.TimeToMillis(hour, minute, second);
				millis = num + millisecond * 1;
				break;
		}
		this._millis = millis;
	}

	public Add(value: TimeSpan): DateTime
	{
		return this.AddMillis(value.TotalMilliseconds);
	}

	private add(value: number, scale: number): DateTime
	{
		// const num = value * scale + ((value >= 0.0) ? 0.5 : (-0.5));
		const num = value * scale;
		if (num <= -315537897600000.0 || num >= 315537897600000.0)
		{
			throw new Error(`ArgumentOutOfRange_AddValue "value"`);
		}
		return this.AddMillis(num * 1);
	}

	public AddDays(value: number): DateTime
	{
		return this.add(value, 86400000);
	}

	public AddHours(value: number): DateTime
	{
		return this.add(value, 3600000);
	}

	public AddMilliseconds(value: number): DateTime
	{
		return this.add(value, 1);
	}

	public AddMinutes(value: number): DateTime
	{
		return this.add(value, 60000);
	}

	public AddMonths(months: number): DateTime
	{
		if (months < -120000 || months > 120000)
		{
			throw new Error(`ArgumentOutOfRange_DateTimeBadMonths "months"`);
		}
		let { year, month, day } = this.GetDatePart2();
		let num = month - 1 + months;
		if (num >= 0)
		{
			month = num % 12 + 1;
			year += divide(num, 12);
		}
		else
		{
			month = 12 + (num + 1) % 12;
			year += divide(num - 11, 12);
		}
		if (year < 1 || year > 9999)
		{
			throw new Error(`ArgumentOutOfRange_DateArithmetic "months"`);
		}
		let num2 = DateTime.DaysInMonth(year, month);
		if (day > num2)
		{
			day = num2;
		}
		return new DateTime(int(DateTime.DateToMillis(year, month, day) + this._millis % 86400000));
	}

	public AddSeconds(value: number): DateTime
	{
		return this.add(value, 1000);
	}

	public AddMillis(value: number): DateTime
	{
		const internalMillis = this._millis;
		return new DateTime(int(internalMillis + value));
	}

	public AddYears(value: number): DateTime
	{
		if (value < -10000 || value > 10000)
		{
			throw new Error(`ArgumentOutOfRange_DateTimeBadYears "years"`);
		}
		return this.AddMonths(value * 12);
	}

	public static Compare(t1: DateTime, t2: DateTime): number
	{
		const internalMillis = t1._millis;
		const internalMillis2 = t2._millis;
		if (internalMillis > internalMillis2)
		{
			return 1;
		}
		if (internalMillis < internalMillis2)
		{
			return -1;
		}
		return 0;
	}

	public CompareTo(value: DateTime): number
	{
		return DateTime.Compare(this, value);
	}

	private static DateToMillis(year: number, month: number, day: number): number
	{
		if (year >= 1 && year <= 9999 && month >= 1 && month <= 12)
		{
			const array = DateTime.IsLeapYear(year) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
			if (day >= 1 && day <= array[month] - array[month - 1])
			{
				const num = year - 1;
				const num2 = num * 365 + divide(num, 4) - divide(num, 100) + divide(num, 400) + array[month - 1] + day - 1;
				return num2 * 86400000;
			}
		}
		throw new Error(`ArgumentOutOfRange_BadYearMonthDay`);
	}

	private static TimeToMillis(hour: number, minute: number, second: number): number
	{
		if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60 && second >= 0 && second < 60)
		{
			return TimeSpan.TimeToMillis(hour, minute, second);
		}
		throw new Error(`ArgumentOutOfRange_BadHourMinuteSecond`);
	}

	public static DaysInMonth(year: number, month: number): number
	{
		if (month < 1 || month > 12)
		{
			throw new Error(`ArgumentOutOfRange_Month "month"`);
		}
		const array = DateTime.IsLeapYear(year) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
		return array[month] - array[month - 1];
	}

	public Equals(value: DateTime): boolean
	{
		return this._millis == value._millis;
	}

	private GetDatePart(part: number): number
	{
		const internalMillis = this._millis;
		let num = divide(internalMillis, 86400000);
		let num2 = divide(num, 146097);
		num -= num2 * 146097;
		let num3 = divide(num, 36524);
		if (num3 == 4)
		{
			num3 = 3;
		}
		num -= num3 * 36524;
		let num4 = divide(num, 1461);
		num -= num4 * 1461;
		let num5 = divide(num, 365);
		if (num5 == 4)
		{
			num5 = 3;
		}
		if (part == 0)
		{
			return num2 * 400 + num3 * 100 + num4 * 4 + num5 + 1;
		}
		num -= num5 * 365;
		if (part == 1)
		{
			return num + 1;
		}
		const array = (num5 == 3 && (num4 != 24 || num3 == 3)) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
		let i: number;
		for (i = (num >> 5) + 1; num >= array[i]; i++)
		{
		}
		if (part == 2)
		{
			return i;
		}
		return num - array[i - 1] + 1;
	}

	private GetDatePart2(): { year: number; month: number; day: number; }
	{
		const internalMillis = this._millis;
		let num = divide(internalMillis, 86400000);
		let num2 = divide(num, 146097);
		num -= num2 * 146097;
		let num3 = divide(num, 36524);
		if (num3 == 4)
		{
			num3 = 3;
		}
		num -= num3 * 36524;
		let num4 = divide(num, 1461);
		num -= num4 * 1461;
		let num5 = divide(num, 365);
		if (num5 == 4)
		{
			num5 = 3;
		}
		let year = num2 * 400 + num3 * 100 + num4 * 4 + num5 + 1;
		num -= num5 * 365;
		const array = (num5 == 3 && (num4 != 24 || num3 == 3)) ? DateTime.s_daysToMonth366 : DateTime.s_daysToMonth365;
		let i: number;
		for (i = (num >> 5) + 1; num >= array[i]; i++)
		{
		}
		let month = i;
		let day = num - array[i - 1] + 1;
		return { year, month, day };
	}

	public GetHashCode(): number
	{
		const internalMillis = this._millis;
		return int(internalMillis) ^ int(internalMillis >> 32);
	}

	public static IsLeapYear(year: number): boolean
	{
		if (year < 1 || year > 9999)
		{
			throw new Error(`ArgumentOutOfRange_Year "year"`);
		}
		if (year % 4 == 0)
		{
			if (year % 100 == 0)
			{
				return year % 400 == 0;
			}
			return true;
		}
		return false;
	}

	public Subtract(value: DateTime): TimeSpan
	{
		return new TimeSpan(this._millis - value._millis);
	}

	public ToString(format = 'yyyy-MM-dd HH:mm:ss'): string
	{
		const data:  {[n: string]: string} = {};
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
		data['ff'] = (<string> data['fff']).substr(0, 2);
		let output = '';
		const parts = format.split(/(yyyy|MM|M|dd|d|HH|H|mm|m|ss|s|fff|ff)?/);
		for (let index = 0; index < parts.length; index++)
		{
			const item = parts[index];
			output += data[item] != null ? data[item] : item;
		}

		return output;
	}

	public static FromUTCTimeStamp(timestamp: number): DateTime
	{
		return DateTime.FromJSTimestamp(timestamp * 1000);
	}
	public static FromJSTimestamp(timestamp: number): DateTime
	{
		return DateTime.FromJavaScriptDate(new Date(timestamp));
	}

	public static FromJavaScriptDate(date: Date): DateTime
	{
		const d = date;
		return new DateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
	}

	public ToJavaScriptTimestamp(): number
	{
		return this.ToJavaScriptDate().valueOf();
	}

	public ToJavaScriptDate(): Date
	{
		return new Date(
			this.Year,
			this.Month - 1,
			this.Day,
			this.Hour,
			this.Minute,
			this.Second,
			this.Millisecond,
		);
	}

	public ToJSONString()
	{
		return JSON.stringify(this);
	}

	public static FromJSONString(value:string)
	{
		let result = JSON.parse(value) as {_millis:number};
		return new DateTime(result._millis);
	}

	
	@TestMethod
	//@ts-ignore
	public Test_DateTime_AddMilliseconds()
	{
		let min1 = new DateTime(2020, 7, 1);
		let max1 = new DateTime(2020, 7, 2);
		let span = max1.Subtract(min1);

		AreEqual('2020-06-30 00:00:00', min1.AddMilliseconds(-span.TotalMilliseconds).ToString());
		AreEqual('1.00:00:00', span.ToString());
		AreEqual('2020-07-01 00:00:00', min1.ToString());
	}

	@TestMethod
	//@ts-ignore
	public Test_DateTime_Divide()
	{
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

	@TestMethod
	//@ts-ignore
	public Test_TimeSpan_Creators()
	{
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


//@ts-ignore
export function TestMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor)
{
	try
	{
		descriptor.value();
		console.info('%c ✔', 'color: green', `UnitTest '${propertyKey.toString()}' passed!`);
	} catch (ex)
	{
		console.error('%c ❌', 'color: red', `UnitTest '${propertyKey.toString()}' faild!`, '\n', ex);
	}
}

export function AreEqual<T>(expected: T, actual: T)
{
	let equal = true;
	if (null == expected)
	{
		if (null != actual && actual !== expected)
		{
			equal = false;
		}
	} else if (expected !== actual)
	{
		equal = false;
	}

	if (!equal)
	{
		throw new Error('expected = ' + expected + ', ' + 'actual = ' + actual);
	}
};

export function divide(value: number, factor: number)
{
	return int(+value / +factor);
}

export function int(value: number)
{
	return +value >= 0 ? Math.floor(+value) : Math.ceil(+value);
}

//@ts-ignore
window['DateTime'] = DateTime;
//@ts-ignore
window['TimeSpan'] = TimeSpan;