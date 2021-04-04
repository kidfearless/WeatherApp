import { Config } from "./Implementations/BrowserConfig.js";
import { DateTime, TimeSpan } from "./datetime.js";
import { WeatherUnits } from "./OpenWeatherMapAPI/weatherUnits.js";
export class ConfigManager {
    static get UseFeelsLike() {
        return Config.Get("UseFeelsLike", false);
    }
    static set UseFeelsLike(value) {
        Config.Set("UseFeelsLike", value);
    }
    static get UseCelcius() {
        return Config.Get("UseCelcius", false);
    }
    static set UseCelcius(value) {
        Config.Set("UseCelcius", value);
    }
    static get WeatherUnits() {
        return ConfigManager.UseCelcius ? WeatherUnits.Metric : WeatherUnits.Imperial;
    }
    static get DegreesSymbol() {
        return ConfigManager.UseCelcius ? "°C" : "°F";
    }
    static get AlertPoint() {
        return Config.Get("AlertPoint", 40.0);
    }
    static set AlertPoint(value) {
        Config.Set("AlertPoint", value);
    }
    static get UpdateRate() {
        return new TimeSpan(Config.Get("UpdateRate", 10000));
    }
    static set UpdateRate(value) {
        Config.Set("UpdateRate", value.TotalMilliseconds);
    }
    static get LastAlertDate() {
        let lastdate = Config.Get("LastAlertDate", DateTime.MinValue.ToJSONString());
        return DateTime.FromJSONString(lastdate);
    }
    static set LastAlertDate(value) {
        Config.Set("LastAlertDate", DateTime.Today.ToJSONString());
    }
    static get CurrentPosition() {
        return Config.Get("CurrentPosition");
    }
    static set CurrentPosition(value) {
        Config.Set("CurrentPosition", value);
    }
    static get CurrentWeather() {
        return Config.Get("CurrentWeather");
    }
    static set CurrentWeather(value) {
        Config.Set("CurrentWeather", value);
    }
    static get SavedForecast() {
        return Config.Get("SavedForecast");
    }
    static set SavedForecast(value) {
        Config.Set("SavedForecast", value);
    }
}
//# sourceMappingURL=ConfigManager.js.map