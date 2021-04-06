export var DEBUG = true;
import { OpenWeatherAPI } from './OpenWeatherMapAPI/openWeatherAPI.js';
import { NotificationManager } from "./INotificationManager.js";
import { LanguageCode } from "./OpenWeatherMapAPI/languageCode.js";
import * as GeoLocation from "./GeoLocationExtensions.js";
import { DateTime, TimeSpan } from "./datetime.js";
import { EventManager } from './EventManager.js';
import { Debug } from './Debug.js';
import { OpenWeatherIcons } from './OpenWeatherIcons.js';
import { ConfigManager } from "./ConfigManager.js";
import { OpenWeatherApiKey } from "./Secrets.js";
class App {
    constructor() {
        this.UpdateRate = TimeSpan.FromSeconds(100);
        this.Timer = undefined;
        this.Timeout = undefined;
        this.BoundValues = false;
        this.WeatherAPI = new OpenWeatherAPI(OpenWeatherApiKey);
        this.MainWeather = document.getElementById("MainWeather");
        this.RootElement = document.getElementById("App");
        this.HourlyWeather = document.getElementById("HourlyWeather");
        this.EstimationReport = document.getElementById("EstimationReport");
        this.SettingsBox = document.getElementById("SettingsBox");
        let tickButton = document.getElementById("TickButton");
        tickButton.onclick = () => this.Timer_Ticked();
        this.GeoLocation = navigator.geolocation;
        this.BindValues();
        this.LoadSavedData();
        this.ForeCastRetrieved = new EventManager();
        this.PositionRetrieved = new EventManager();
        this.GoodWeatherAlerted = new EventManager();
        this.DataBindingUpdated = new EventManager();
        this.ForeCastRetrieved.Add(this.OnForecastRetrieved.bind(this));
        this.DataBindingUpdated.Add(this.OnDataBindingUpdated.bind(this));
        if (DEBUG) {
            ConfigManager.LastAlertDate = DateTime.MinValue;
        }
    }
    BindValues() {
        if (this.BoundValues) {
            return;
        }
        this.BoundValues = true;
        let numberBindings = document.querySelectorAll(`*[data-bindconfignumber]`);
        numberBindings.forEach((element) => {
            let property = element.dataset["bindconfignumber"];
            if (ConfigManager[property]) {
                Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
                element.value = `${ConfigManager[property]}`;
            }
            element.addEventListener("input", (ev) => {
                let value = new Number(element.value).valueOf();
                Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);
                let type = typeof (ConfigManager[property]);
                if (type !== "number" && type !== "undefined") {
                    throw new Error(`Attempted to assign numerical value to non numberical type ${type} \`ConfigManager.${property} = ${value}\``);
                }
                ConfigManager[property] = value;
                this.DataBindingUpdated.Invoke(property);
            });
        });
        let stringBindings = document.querySelectorAll(`*[data-bindconfig]`);
        stringBindings.forEach((element) => {
            let property = element.dataset["bindconfignumber"];
            if (ConfigManager[property]) {
                Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
                element.value = ConfigManager[property];
            }
            element.addEventListener("input", (ev) => {
                let value = element.value;
                Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);
                let type = typeof (ConfigManager[property]);
                if (type !== "string" && type !== "undefined") {
                    throw new Error(`Attempted to assign numerical value to non numberical type ${type} \`ConfigManager.${property} = ${value}\``);
                }
                ConfigManager[property] = value;
                this.DataBindingUpdated.Invoke(property);
            });
        });
        let boolBindings = document.querySelectorAll(`*[data-bindconfigbool]`);
        boolBindings.forEach((element) => {
            let property = element.dataset["bindconfigbool"];
            if (ConfigManager[property]) {
                Debug.WriteLine(`Assigning element '${element.id}' to value '${ConfigManager[property]}'`);
                element.checked = ConfigManager[property];
            }
            element.addEventListener("input", (ev) => {
                let value = element.checked;
                Debug.WriteLine(`assigning prop '${property}' to value '${value}'`);
                let type = typeof (ConfigManager[property]);
                if (type !== "boolean" && type !== "undefined") {
                    throw new Error(`Attempted to assign numerical value to non boolean type ${type} \`ConfigManager.${property} = ${value}\``);
                }
                ConfigManager[property] = value;
                this.DataBindingUpdated.Invoke(property);
            });
        });
    }
    LoadSavedData() {
        Debug.WriteLine("Loading Saved Data...");
        let weather = ConfigManager.CurrentWeather;
        if (weather) {
            this.GenerateCurrentWeather(weather);
            Debug.WriteLine("Loaded Weather...");
        }
        let forecast = ConfigManager.SavedForecast;
        if (forecast) {
            this.GenerateForecast(forecast);
            this.GenerateWalkTime(forecast);
            Debug.WriteLine("Loaded Forecast...");
        }
        Debug.WriteLine("Finished Loading Saved Data...");
    }
    OnReady() {
        Debug.WriteLine("Application Fully Ready");
        this.UpdateTimer();
    }
    UpdateTimer() {
        if (!this.Timer) {
            Debug.WriteLine(`Assigning timer update rate to fire every ${this.UpdateRate.TotalSeconds} seconds`);
            this.Timer = setInterval(this.Timer_Ticked.bind(this), this.UpdateRate.TotalMilliseconds);
            this.UpdateWeather();
        }
        else {
            Debug.WriteLine("Timer was not null when assigning it");
        }
    }
    Timer_Ticked() {
        Debug.WriteLine("Timer Ticked");
        this.UpdateWeather();
    }
    UpdateWeather() {
        Debug.WriteLine(`Updating Weather...`);
        if (!this.GetNewPosition()) {
            Debug.WriteLine(`No position Found... Returning Early.`);
            return;
        }
        let position = ConfigManager.CurrentPosition;
        this.WeatherAPI.GetWeatherForecastAsync(position.coords.latitude, position.coords.longitude, ConfigManager.WeatherUnits, LanguageCode.EN)
            .then(forecast => this.ForeCastRetrieved.Invoke(forecast));
        Debug.WriteLine(`Current Position: {lat: ${position.coords.latitude} lon: ${position.coords.longitude}}`);
        this.CheckWeather();
        Debug.WriteLine(`Finished Updating Weather...`);
    }
    CheckWeather() {
        Debug.WriteLine(`Checking Weather...`);
        let weather = ConfigManager.CurrentWeather;
        if (!weather) {
            Debug.WriteLine(`No weather found.`);
            return;
        }
        if (DateTime.Today.Subtract(ConfigManager.LastAlertDate).TotalDays < 1) {
            Debug.WriteLine(`Last notification time was too soon: ${DateTime.Today.Subtract(ConfigManager.LastAlertDate).TotalDays} days`, ConfigManager.LastAlertDate);
            return;
        }
        if (App.GetDesiredTemperature(weather) >= ConfigManager.AlertPoint) {
            Debug.WriteLine(`Weather is good for a walk... Notifying client.`);
            this.GoodWeatherAlerted.Invoke();
            NotificationManager.PushNotification("Time for your walk 🏃", `It's currently ${weather.temp}(${weather.feels_like}) ${ConfigManager.DegreesSymbol} and a perfect time for a walk`);
            ConfigManager.LastAlertDate = DateTime.Today;
        }
        else {
            Debug.WriteLine(`Weather still out of range.`);
        }
        Debug.WriteLine(`Finished Checking Weather.`);
    }
    GetNewPosition() {
        let pingLocation = () => {
            this.GeoLocation.getCurrentPosition((position) => {
                Debug.WriteLine(`Successfully grabbed current location. ${JSON.stringify(position)}`, position);
                this.PositionRetrieved.Invoke(position);
                ConfigManager.CurrentPosition = GeoLocation.Clone(position);
            }, (error) => {
                Debug.WriteLine(`Falied to grab current position. Reason: ${error.message}`);
                Debug.WriteLine(error);
            });
        };
        let position = ConfigManager.CurrentPosition;
        if (!position) {
            Debug.WriteLine("Position null... Retreiving current position...");
            pingLocation();
            return false;
        }
        let lastPositionTime = DateTime.FromJSTimestamp(position.timestamp);
        let diff = DateTime.Now.Subtract(lastPositionTime);
        Debug.WriteLine(`Seconds Since Last Location: ` + diff.TotalSeconds);
        if (diff.TotalHours >= 1) {
            Debug.WriteLine("Location data out of date pulling new data now...");
            pingLocation();
        }
        return true;
    }
    OnForecastRetrieved(data) {
        Debug.WriteLine(`Forecast Retreived: ${data}`, data);
        ConfigManager.SavedForecast = data;
        ConfigManager.CurrentWeather = data.current;
        this.GenerateCurrentWeather(data.current);
        this.GenerateForecast(data);
        this.GenerateWalkTime(data);
    }
    GenerateForecast(data) {
        Debug.WriteLine("Generating Forecast...");
        function generateHTML(weather) {
            let date = DateTime.FromUTCTimeStamp(weather.dt);
            let timestring = ``;
            if (date.Hour == 0) {
                timestring = `12 AM`;
            }
            else if (date.Hour == 12) {
                timestring = `12 PM`;
            }
            else if (date.Hour < 12) {
                timestring = `${date.Hour} AM`;
            }
            else {
                timestring = `${date.Hour - 12} PM`;
            }
            let result = `<div>` +
                `\n	<div>${App.GetDesiredTemperature(weather).toFixed(1)}${ConfigManager.DegreesSymbol}</div>` +
                `\n	<div>${timestring}</div>` +
                `\n	<img src="${OpenWeatherIcons.get(weather.weather[0].icon)}" class="weather-svg" />` +
                `\n</div>`;
            return result;
        }
        this.HourlyWeather.innerHTML = "";
        for (let i = 0; i < 4; i++) {
            let html = generateHTML(data.hourly[i]);
            Debug.WriteLine(`Injecting the following html\n${html}`, html);
            this.HourlyWeather.innerHTML += html;
        }
        Debug.WriteLine(`Generated Forecast...`);
    }
    GenerateWalkTime(data) {
        Debug.WriteLine(`Generating Walk Time...`);
        let bestReport = null;
        let alertPoint = ConfigManager.AlertPoint;
        for (let report of data.hourly) {
            let time = DateTime.FromUTCTimeStamp(report.dt);
            if (time.DayOfWeek !== DateTime.Today.DayOfWeek) {
                break;
            }
            let futureTemp = App.GetDesiredTemperature(report);
            if (futureTemp >= alertPoint) {
                bestReport = report;
                break;
            }
        }
        if (bestReport) {
            Debug.WriteLine(`Walk time found: ${JSON.stringify(bestReport)}`, bestReport);
            let date = DateTime.FromUTCTimeStamp(bestReport.dt);
            this.EstimationReport.innerHTML = `
			<span class="dev-box">${App.GetTime(date)}</span>
			<span class="dev-box">${bestReport.temp.toFixed(0)}${ConfigManager.DegreesSymbol}(${bestReport.feels_like.toFixed(0)}${ConfigManager.DegreesSymbol})</span>`;
        }
        else {
            Debug.WriteLine(`Could not find a good walk time... defaulting to now`);
            this.EstimationReport.innerHTML = `
			<span class="dev-box">Now</span>
			<span class="dev-box">N/A</span>`;
        }
    }
    GenerateCurrentWeather(weather) {
        this.MainWeather.innerHTML = `<h1 class="dev-box">${App.GetDesiredTemperature(weather).toFixed(0)}${ConfigManager.DegreesSymbol}</h1>`;
    }
    OnDataBindingUpdated(property) {
        Debug.WriteLine(`Data-Binding Updated '${property}' = ${ConfigManager[property]}`);
        switch (property) {
            case "UseCelcius":
                this.UpdateWeather();
                break;
            case "UseFeelsLike":
                if (ConfigManager.CurrentWeather) {
                    this.GenerateCurrentWeather(ConfigManager.CurrentWeather);
                }
                if (ConfigManager.SavedForecast) {
                    this.GenerateForecast(ConfigManager.SavedForecast);
                    this.GenerateWalkTime(ConfigManager.SavedForecast);
                }
                break;
        }
    }
    static GetTime(date) {
        let timestring = ``;
        if (date.Hour == 0) {
            timestring = `12 AM`;
        }
        else if (date.Hour == 12) {
            timestring = `12 PM`;
        }
        else if (date.Hour < 11) {
            timestring = `${date.Hour} AM`;
        }
        else {
            timestring = `${date.Hour - 12} PM`;
        }
        return timestring;
    }
    static GetDesiredTemperature(weather) {
        if (ConfigManager.UseFeelsLike) {
            return weather.feels_like;
        }
        else {
            return weather.temp;
        }
    }
}
const app = new App();
document.addEventListener('deviceready', () => app.OnReady());
if (DEBUG) {
    window["Application"] = app;
}
//# sourceMappingURL=app.js.map