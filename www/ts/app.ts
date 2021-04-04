
export var DEBUG = true;


import { OpenWeatherAPI } from './OpenWeatherMapAPI/openWeatherAPI.js';
import { WeatherUnits } from "./OpenWeatherMapAPI/weatherUnits.js";
import { NotificationManager } from "./INotificationManager.js";
import { LanguageCode } from "./OpenWeatherMapAPI/languageCode.js";
// import { luxon.DateTime, TimeSpan } from "./_luxon.DateTime.js";
import * as GeoLocation from "./GeoLocationExtensions.js";
import { DateTime, TimeSpan } from "./datetime.js";
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

type Timer = number|undefined;

class App
{
	//#region html elements
	private RootElement: HTMLDivElement;
	private HourlyWeather: HTMLDivElement;
	private EstimationReport: HTMLDivElement;
	private SettingsBox: HTMLDivElement;
	private MainWeather: HTMLDivElement;
	//#endregion


	private Timer: Timer;
	private WeatherAPI: OpenWeatherAPI;

	//#region events
	public WeatherRetrieved: EventManager<CurrentWeather>;
	public ForeCastRetrieved: EventManager<OneCallResponse>;
	public PositionRetrieved: EventManager<GeolocationPosition>;
	public GoodWeatherAlerted: EventManager;
	// fired the config has been updated with the new values
	// passes the changed property in it's parameter
	public DataBindingUpdated: EventManager<string>;
	private Timeout: Timer;
	//#endregion


	/**
	 * Initializes the fields with either the default values or with their corresponding elements
	 */
	constructor()
	{
		this.Timer = undefined;
		this.Timeout = undefined;

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
		this.DataBindingUpdated = new EventManager();


		this.ForeCastRetrieved.Add(this.OnForecastRetrieved.bind(this));
		this.WeatherRetrieved.Add(this.OnWeatherRetreived.bind(this));
		this.DataBindingUpdated.Add(this.OnDataBindingUpdated.bind(this))
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
				this.DataBindingUpdated.Invoke(property);
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
				this.DataBindingUpdated.Invoke(property);
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
				this.DataBindingUpdated.Invoke(property);
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
		this.UpdateTimer();
	}

	private UpdateTimer()
	{
		if (!this.Timer)
		{
			Debug.WriteLine(`assigning timer update rate to fire every ${ConfigManager.UpdateRate.TotalSeconds} seconds`);
			this.Timer = setInterval(this.Timer_Ticked.bind(this) as TimerHandler, ConfigManager.UpdateRate.TotalMilliseconds);
			this.Timer_Ticked();
		}
		else
		{
			Debug.WriteLine("Timer was not null when assigning it");
		}
	}

	/**
	 * Callback for repeating timer to check weather and forecasts for our points
	 * Fired every 10 seconds by default.
	 * @noreturn
	 */
	private Timer_Ticked()
	{
		this.UpdateWeather();
	}

	private UpdateWeather()
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
			 position.coords.longitude, ConfigManager.WeatherUnits, LanguageCode.EN)
			 .then(weather => this.WeatherRetrieved.Invoke(weather));
 
		 // 
		 this.WeatherAPI.GetWeatherForecastAsync(position.coords.latitude, position.coords.longitude,
			 ConfigManager.WeatherUnits, LanguageCode.EN)
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

		if (App.GetDesiredTemperature(weather.main) >= ConfigManager.AlertPoint)
		{
			this.GoodWeatherAlerted.Invoke();
			NotificationManager.PushNotification("Time for your walk 🏃", `It's currently ${weather.main.temp}(${weather.main.feels_like}) ${ConfigManager.DegreesSymbol} and a perfect time for a walk`);
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

		Debug.WriteLine(`Seconds Since Last Location: ` + diff.TotalSeconds);
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
						<div>${App.GetDesiredTemperature(weather).toFixed(1)}${ConfigManager.DegreesSymbol}</div>
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

			let futureTemp = App.GetDesiredTemperature(report);


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
			<span class="dev-box">${bestReport.temp.toFixed(0)}${ConfigManager.DegreesSymbol}(${bestReport.feels_like.toFixed(0)}${ConfigManager.DegreesSymbol})</span>`;
		}
		else
		{
			this.EstimationReport.innerHTML = `
			<span class="dev-box">Now</span>
			<span class="dev-box">N/A</span>`;
		}

	}


	private GenerateCurrentWeather(weather: CurrentWeather)
	{
		// might seem silly to put this single line in a function, it's just to match the naming of the other generate functions
		this.MainWeather.innerHTML = `<h1 class="dev-box">${App.GetDesiredTemperature(weather.main).toFixed(0)}${ConfigManager.DegreesSymbol}</h1>`;
	}

	private OnWeatherRetreived(weather: CurrentWeather)
	{
		ConfigManager.CurrentWeather = weather;
		this.GenerateCurrentWeather(weather);
	}

	// Fired after the config has been assigned
	private OnDataBindingUpdated(property:string)
	{
		switch (property) {
			case "UseCelcius":
				this.UpdateWeather();
				break;
			case "UseFeelsLike":
				this.GenerateCurrentWeather(ConfigManager.CurrentWeather!);
				this.GenerateForecast(ConfigManager.SavedForecast!);
				this.GenerateWalkTime(ConfigManager.SavedForecast!);
			case "UpdateRateInSeconds":
				// stop the old timer
				Debug.WriteLine(`Clearing timer '${this.Timer}'`);
				clearInterval(this.Timer);
				// need to null this out so that it can be re-assigned
				this.Timer = undefined;
				// if they are updating a lot clear the next update func
				Debug.WriteLine(`Clearing timeout '${this.Timeout}'`);
				clearTimeout(this.Timeout);
				// Create the new timer after their current update rate has passed
				// So if they went from every 10 seconds to every 15, then we wait 15 seconds then create the timer.
				Debug.WriteLine(`Creating the new timer in '${ConfigManager.UpdateRate.TotalSeconds}' seconds`);
				this.Timeout = setTimeout((() => this.UpdateTimer()) as TimerHandler, ConfigManager.UpdateRate.TotalMilliseconds);
				break;
		}
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

	private static GetDesiredTemperature(weather: { feels_like: number; temp: number; })
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
