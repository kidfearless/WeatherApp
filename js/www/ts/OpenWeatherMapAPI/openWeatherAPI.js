var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WeatherUnits } from './weatherUnits.js';
import { LanguageCode } from './languageCode.js';
export class OpenWeatherAPI {
    /**
     *
     */
    constructor(key = ``) {
        this.APIKey = key;
    }
    GetCurrentWeather(location, units, languageCode) {
        var url = `https://api.openweathermap.org/data/${OpenWeatherAPI.APIVersion}/weather?` +
            location +
            `&units=${WeatherUnits[units].toLowerCase()}` +
            `&lang=${LanguageCode[languageCode].toLowerCase()}` +
            `&appid=${this.APIKey}`;
        return this.GetResponse(url);
    }
    GetCurrentWeatherByCityAsync(city, units = WeatherUnits.Imperial, languageCode = LanguageCode.EN) {
        return this.GetCurrentWeather(`q=${city}`, units, languageCode);
    }
    GetCurrentWeatherByIDAsync(cityID, units = WeatherUnits.Imperial, languageCode = LanguageCode.EN) {
        return this.GetCurrentWeather(`q=${cityID}`, units, languageCode);
    }
    GetCurrentWeatherAsync(latitude, longitude, units = WeatherUnits.Imperial, languageCode = LanguageCode.EN) {
        return this.GetCurrentWeather(`lat=${latitude}&lon=${longitude}`, units, languageCode);
    }
    GetCurrentWeatherByCoordinateAsync(coordinates, units = WeatherUnits.Imperial, languageCode = LanguageCode.EN) {
        return this.GetCurrentWeather(`lat=${coordinates.lat}&lon=${coordinates.lon}`, units, languageCode);
    }
    GetResponse(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(url);
            let json = yield response.json();
            return json;
        });
    }
}
OpenWeatherAPI.APIVersion = `2.5`;
//# sourceMappingURL=openWeatherAPI.js.map