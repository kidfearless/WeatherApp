var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("app.js");
import { Config } from "./DebugConfig.js";
import { OpenWeatherAPI } from './OpenWeatherMapAPI/openWeatherAPI.js';
import { WeatherUnits } from "./OpenWeatherMapAPI/weatherUnits.js";
import { NotificationManager } from "./BrowserNotificationManager.js";
import { LanguageCode } from "./OpenWeatherMapAPI/languageCode.js";
import { DateTime } from "../../node_modules/datetime-dotnet/datetime.js";
class App {
    /**
     *
     */
    constructor() {
        this.Timer = 0;
        this.RootElement = document.getElementById("App");
        this.WeatherAPI = new OpenWeatherAPI("208a05a6095a019a9f778b0680b771b3");
    }
    OnReady() {
        console.log("ready");
        if (!this.Timer) {
            console.log("timer is null");
            document.addEventListener("click", this.Mouse_Clicked.bind(this));
            this.Timer = setInterval(this.Timer_Ticked, Config.Get("UpdateRate", 30000));
            this.Timer_Ticked();
            console.log(`pinging every ${Config.Get("UpdateRate")} milliseconds`);
        }
    }
    Mouse_Clicked() {
        // notifyMe();
        NotificationManager.PushNotification("test", "message");
    }
    Timer_Ticked() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("timer ticked");
            let position = Config.Get("CurrentPosition");
            // let lastPositionTime = new Date(position.timestamp * ?1000 /* seconds to milliseconds */)
            if (!position /*  || Date.now() - lastPositionTime > */) {
                navigator.geolocation.getCurrentPosition((position) => {
                    Config.Set("CurrentPosition", position);
                });
                return;
            }
            let weather = yield this.WeatherAPI
                .GetCurrentWeatherAsync(position.coords.latitude, position.coords.longitude, WeatherUnits.Imperial, LanguageCode.EN);
            console.log(weather);
            this.RootElement.innerHTML += `Ticked <br />CurrentWeather: ${weather.main.feels_like.toPrecision(1)} ℉`;
            let useFeelsLike = Config.Get("UseFeelsLike", true);
            let temperature = useFeelsLike ? weather.main.feels_like : weather.main.temp;
            let alertPoint = Config.Get("AlertPoint", 50.0);
            let lastAlertDate = Config.Get("LastAlertDate", DateTime.MinValue);
            if (temperature >= alertPoint && DateTime.Today.Subtract(lastAlertDate).Days >= 1) {
                NotificationManager.PushNotification("Time for your walk", `It's currently ${weather.main.temp.toPrecision(1)} ℉ and a perfect time for a walk`);
                Config.Set("LastAlertDate", DateTime.Today);
            }
        });
    }
}
function notifyMe() {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("Hi there!");
    }
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
    }
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
}
const app = new App();
document.addEventListener('deviceready', () => app.OnReady());
console.log("app.js end");
//# sourceMappingURL=app.js.map