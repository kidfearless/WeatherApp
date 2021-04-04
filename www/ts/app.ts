
export var DEBUG = true;


import { OpenWeatherAPI } from './OpenWeatherMapAPI/openWeatherAPI.js';
import { WeatherUnits } from "./OpenWeatherMapAPI/weatherUnits.js";
import { NotificationManager } from "./INotificationManager.js";
import { LanguageCode } from "./OpenWeatherMapAPI/languageCode.js";
// import { luxon.DateTime, TimeSpan } from "./_luxon.DateTime.js";
import * as GeoLocation from "./GeoLocationExtensions.js";
import { DateTime } from "./datetime.js";
import { CurrentWeather } from "./OpenWeatherMapAPI/currentWeather.js";
import { EventListenerCallback, EventManager } from './EventManager.js';
import { OneCallResponse, WeatherReport, Weather } from './OpenWeatherMapAPI/oneCall.js';
import { Debug } from './Debug.js';
import { OpenWeatherIcons } from './OpenWeatherIcons.js';
import { ConfigManager } from "./ConfigManager.js";

// Really the only way to protect my api keys while publishing this to the public is by managing it in my own server.
// I don't feel like adding another .2-.5 seconds to all my calls so let's just hide it from git and call it a day.
import { OpenWeathApiKey as OpenWeatherApiKey } from "./Secrets.js";
import { OpenWeathApiKey } from './Secrets';

class App
{
	//#region html elements
	private RootElement: HTMLDivElement;
	private HourlyWeather: HTMLDivElement;
	private EstimationReport: HTMLDivElement;
	private SettingsBox: HTMLDivElement;
	private MainWeather: HTMLDivElement;
	//#endregion


	private Timer: number | NodeJS.Timeout;
	private WeatherAPI: OpenWeatherAPI;

	//#region events
	public WeatherRetrieved: EventManager<CurrentWeather>;
	public ForeCastRetrieved: EventManager<OneCallResponse>;
	public PositionRetrieved: EventManager<GeolocationPosition>;
	public GoodWeatherAlerted: EventManager;
	//#endregion

	//#region Config Wrappers


	//#endregion

	/**
	 * Initializes the fields with either the default values or with their corresponding elements
	 */
	constructor()
	{
		this.Timer = 0;

		this.WeatherAPI = new OpenWeatherAPI(OpenWeatherApiKey);

		// I would normally put these assignments in their own functions but I guess typescript doesn't like that.

		this.MainWeather = document.getElementById("MainWeather") as HTMLDivElement;
		this.RootElement = document.getElementById("App") as HTMLDivElement;
		this.HourlyWeather = document.getElementById("HourlyWeather") as HTMLDivElement;
		this.EstimationReport = document.getElementById("EstimationReport") as HTMLDivElement;
		this.SettingsBox = document.getElementById("SettingsBox") as HTMLDivElement;

		this.BindValues();

		this.LoadSavedData();

		this.WeatherRetrieved = new EventManager();
		this.ForeCastRetrieved = new EventManager();
		this.PositionRetrieved = new EventManager();
		this.GoodWeatherAlerted = new EventManager();


		this.ForeCastRetrieved.Add(this.OnForecastRetrieved.bind(this));
		this.WeatherRetrieved.Add(this.OnWeatherRetreived.bind(this));
	}

	// iterates through all the elements that have a data binding, assigning them the cached values and listening for changes
	private BindValues()
	{
		let numberBindings = document.querySelectorAll(`*[data-bindconfignumber]`);

		numberBindings.forEach((element:HTMLInputElement) => 
		{
			// get the property that we're binding to, it's not undefined otherwise we wouldn't have gotten here
			let property:string = element.dataset["bindconfignumber"] as string;
			if(ConfigManager[property])
			{
				Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
				element.value = `${ConfigManager[property]}`;
			}
			element.addEventListener("input", (ev:InputEvent) =>
			{
				// a bit weird, but we can't confirm if this is float or int
				// so create a new number from the string and then get it's primitive underlying type
				let value = new Number(element.value).valueOf();

				Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);

				// not likely to happen but if we ever accidentally use bindconfignumber for non numeric value then we should be alerted
				let type = typeof(ConfigManager[property]);
				if(type !== "number" && type !== "undefined")
				{
					throw new Error(`Attempted to assign numerical value to non numberical type ${type} \`ConfigManager.${property} = ${value}\``);
				}

				ConfigManager[property] = value;
			});
		});

		let stringBindings = document.querySelectorAll(`*[data-bindconfig]`);

		stringBindings.forEach((element:HTMLInputElement) => 
		{
			// get the property that we're binding to, it's not undefined otherwise we wouldn't have gotten here
			let property:string = element.dataset["bindconfignumber"] as string;
			if(ConfigManager[property])
			{
				Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
				element.value = ConfigManager[property];
			}
			element.addEventListener("input", (ev:InputEvent) =>
			{
				// don't really need to validate it as the value *should* always be a string
				let value = element.value;

				Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);

				// not likely to happen but if we ever accidentally use bindconfignumber for non numeric value then we should be alerted
				let type = typeof(ConfigManager[property]);
				if(type !== "string" && type !== "undefined")
				{
					throw new Error(`Attempted to assign numerical value to non numberical type ${type} \`ConfigManager.${property} = ${value}\``);
				}

				ConfigManager[property] = value;
			});
		});
		
		let boolBindings = document.querySelectorAll(`*[data-bindconfigbool]`);
		boolBindings.forEach((element:HTMLInputElement) => 
		{
			// get the property that we're binding to, it's not undefined otherwise we wouldn't have gotten here
			let property:string = element.dataset["bindconfigbool"] as string;
			if(ConfigManager[property])
			{
				Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
				element.checked = ConfigManager[property];
			}
			element.addEventListener("input", (ev:InputEvent) =>
			{
				
				// all input elements have a checked property, so we have to have a separate one for checkboxes
				let value = element.checked;

				Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);

				// not likely to happen but if we ever accidentally use bindconfignumber for non numeric value then we should be alerted
				let type = typeof(ConfigManager[property]);
				if(type !== "boolean" && type !== "undefined")
				{
					throw new Error(`Attempted to assign numerical value to non boolean type ${type} \`ConfigManager.${property} = ${value}\``);
				}

				ConfigManager[property] = value;
			});
		});


	}
	private LoadSavedData()
	{
		Debug.WriteLine("Loading Saved Data...");
		let weather = ConfigManager.CurrentWeather;
		if(weather)
		{
			this.GenerateCurrentWeather(weather);
			Debug.WriteLine("Loaded Weather...");
		}
		let forecast = ConfigManager.SavedForecast;
		if(forecast)
		{
			this.GenerateForecast(forecast);
			this.GenerateWalkTime(forecast);
			Debug.WriteLine("Loaded Forecast...");
		}
		Debug.WriteLine("Finished Loading Saved Data...");

	}

	// Fired when cordova interfaces are accessible
	public OnReady()
	{
		if (!this.Timer)
		{
			this.Timer = setInterval(this.Timer_Ticked.bind(this), ConfigManager.UpdateRate.TotalMilliseconds);
			this.Timer_Ticked();
		}
	}

	/**
	 * Callback for repeating timer to check weather and forecasts for our points
	 * Fired every 10 seconds by default.
	 * @noreturn
	 */
	private Timer_Ticked()
	{
		// return;
		 // get the current position
		let position = ConfigManager.CurrentPosition;
		// if it's null then update and return early
		if (!position)
		{
			navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => 
			{
				this.PositionRetrieved.Invoke(position);
				ConfigManager.CurrentPosition = GeoLocation.Clone(position);
			});
			return;
		}

		// Update the position if needed
		this.GetNewPosition(position);

		// get the current weather
		this.WeatherAPI.GetCurrentWeatherAsync(position.coords.latitude,
			position.coords.longitude, WeatherUnits.Imperial, LanguageCode.EN)
			.then(weather => this.WeatherRetrieved.Invoke(weather));

		// 
		this.WeatherAPI.GetWeatherForecastAsync(position.coords.latitude, position.coords.longitude,
			WeatherUnits.Imperial, LanguageCode.EN)
			.then(forecast => this.ForeCastRetrieved.Invoke(forecast));

		Debug.WriteLine(`lat: ${position.coords.latitude} lon: ${position.coords.longitude}`);
		// Check if we should alert them of these changes yet or not
		this.CheckWeather(); 
	}

	/**
	 * Checks the current weather to see if it's time for a walk and alerts them if they haven't been alerted today.
	 * @noreturn
	 */
	private CheckWeather()
	{
		let weather = ConfigManager.CurrentWeather;
		if (!weather)
		{
			return;
		}

		if (DateTime.Today.Subtract(ConfigManager.LastAlertDate).TotalDays < 1)
		{
			return;
		}

		if (this.GetDesiredTemperature(weather.main) >= ConfigManager.AlertPoint)
		{
			this.GoodWeatherAlerted.Invoke();
			NotificationManager.PushNotification("Time for your walk 🏃", `It's currently ${weather.main.temp} ℉ and a perfect time for a walk`);
			ConfigManager.LastAlertDate = DateTime.Today;
		}
	}

	/**
	 * Checks the time since we've last queuried their location and updates it if needed.
	 * @param position 
	 */
	private GetNewPosition(position: GeolocationPosition)
	{
		let lastPositionTime = DateTime.FromJSTimestamp(position.timestamp);
		let diff = DateTime.Now.Subtract(lastPositionTime);

		console.log(`Seconds Since Last Location: ` + diff.TotalSeconds);
		if (diff.TotalHours >= 1)
		{
			navigator.geolocation.getCurrentPosition((position: GeolocationPosition) =>
			{
				this.PositionRetrieved.Invoke(position);
				ConfigManager.CurrentPosition = GeoLocation.Clone(position);
			});
		}
	}

	/**
	 * Fired every time the weather forecast is retreived.
	 * Used to generate the forecast view and predict when the next walk time should be.
	 * @param data - OpenWeatherMap's forecast response object
	 */
	private OnForecastRetrieved(data: OneCallResponse)
	{
		ConfigManager.SavedForecast = data;
		this.GenerateForecast(data);
		this.GenerateWalkTime(data);
	}


	private GenerateForecast(data: OneCallResponse)
	{
		function generateHTML(weather: WeatherReport)
		{
			let date = DateTime.FromUTCTimeStamp(weather.dt);
			let timestring = ``;
			if (date.Hour == 0)
			{
				timestring = `12 AM`;
			}
			else if (date.Hour == 12)
			{
				timestring = `12 PM`;
			}
			else if (date.Hour < 12)
			{
				timestring = `${date.Hour} AM`;
			}

			else
			{
				timestring = `${date.Hour - 12} PM`;
			}

			return `<div>
						<div>${weather.temp.toFixed(1)}℉</div>
						<img src="${OpenWeatherIcons.get(weather.weather[0].icon)}" class="weather-svg" />
						<div>${timestring}</div>
					</div>`;
		}

		this.HourlyWeather.innerHTML = "";
		for (let i = 0; i < 4; i++)
		{
			this.HourlyWeather.innerHTML += generateHTML(data.hourly[i]);
		}
	}


	private GenerateWalkTime(data: OneCallResponse)
	{
		let bestReport: null | WeatherReport = null;
		let alertPoint = ConfigManager.AlertPoint;
		for (let report of data.hourly)
		{
			let time = DateTime.FromUTCTimeStamp(report.dt);
			if (time.DayOfWeek !== DateTime.Today.DayOfWeek)
			{
				break;
			}

			let futureTemp = this.GetDesiredTemperature(report);


			if (futureTemp >= alertPoint)
			{
				bestReport = report;
				break;
			}
		}

		if (bestReport)
		{
			let date = DateTime.FromUTCTimeStamp(bestReport.dt);
			this.EstimationReport.innerHTML = `
			<span class="dev-box">${App.GetTime(date)}</span>
			<span class="dev-box">${bestReport.temp.toFixed(0)}℉</span>`;
		}
		else
		{
			this.EstimationReport.innerHTML = `
			<span class="dev-box">N/A</span>
			<span class="dev-box">${ConfigManager.CurrentWeather?.main.temp ?? "N/A"}℉</span>`;
		}

	}


	private GenerateCurrentWeather(weather: CurrentWeather)
	{
		// might seem silly to put this single line in a function, it's just to match the naming of the other generate functions
		this.MainWeather.innerHTML = `<h1 class="dev-box">${weather.main.temp.toFixed(0)}℉</h1>`;
	}

	private OnWeatherRetreived(weather: CurrentWeather)
	{
		ConfigManager.CurrentWeather = weather;
		this.GenerateCurrentWeather(weather);
	}


	private static GetTime(date: DateTime)
	{
		let timestring = ``;
		if (date.Hour == 0)
		{
			timestring = `12 AM`;
		}
		else if (date.Hour == 12)
		{
			timestring = `12 PM`;
		}
		else if (date.Hour < 11)
		{
			timestring = `${date.Hour} AM`;
		}
		else
		{
			timestring = `${date.Hour - 12} PM`;
		}
		return timestring;
	}

	private GetDesiredTemperature(weather: { feels_like: number; temp: number; })
	{
		if (ConfigManager.UseFeelsLike)
		{
			return weather.feels_like;
		}
		else
		{
			return weather.temp;
		}
	}

}

const app = new App();

document.addEventListener('deviceready', () => app.OnReady());
