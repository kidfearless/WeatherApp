import { Config } from "./Implementations/BrowserConfig.js";
import { DateTime, TimeSpan } from "./datetime.js";
import { CurrentWeather } from "./OpenWeatherMapAPI/currentWeather.js";
import { OneCallResponse } from './OpenWeatherMapAPI/oneCall.js';


export class ConfigManager
{
	static [property: string]: any;
	public static get UseFeelsLike()
	{
		return Config.Get<boolean>("UseFeelsLike", false);
	}
	public static set UseFeelsLike(value: boolean)
	{
		Config.Set("UseFeelsLike", value);
	}

	public static get UseCelcius()
	{
		return Config.Get<boolean>("UseCelcius", false);
	}
	public static set UseCelcius(value: boolean)
	{
		Config.Set("UseCelcius", value);
	}

	public static get AlertPoint()
	{
		return Config.Get<number>("AlertPoint", 40.0);
	}
	public static set AlertPoint(value: number)
	{
		Config.Set("AlertPoint", value);
	}

	public static get UpdateRate(): TimeSpan
	{
		return new TimeSpan(Config.Get<number>("UpdateRate", 10000));
	}
	public static set UpdateRate(value: TimeSpan)
	{
		Config.Set("UpdateRate", value.TotalMilliseconds);
	}

	public static get LastAlertDate()
	{
		let lastdate = Config.Get<string>("LastAlertDate",
			DateTime.MinValue.ToJSONString());

		return DateTime.FromJSONString(lastdate);
	}
	public static set LastAlertDate(value: DateTime)
	{
		Config.Set("LastAlertDate", DateTime.Today.ToJSONString());
	}

	public static get CurrentPosition(): GeolocationPosition | null
	{
		return Config.Get<GeolocationPosition>("CurrentPosition");
	}
	public static set CurrentPosition(value: GeolocationPosition | null)
	{
		Config.Set("CurrentPosition", value);
	}

	public static get CurrentWeather(): CurrentWeather | null
	{
		return Config.Get<CurrentWeather>("CurrentWeather");
	}
	public static set CurrentWeather(value: CurrentWeather | null)
	{
		Config.Set("CurrentWeather", value);
	}

	public static get SavedForecast(): OneCallResponse | null
	{
		return Config.Get<OneCallResponse>("SavedForecast");
	}
	public static set SavedForecast(value: OneCallResponse | null)
	{
		Config.Set("SavedForecast", value);
	}


}
