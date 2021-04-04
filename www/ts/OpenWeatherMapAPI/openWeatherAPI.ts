import { CurrentWeather } from './currentWeather.js';
import { WeatherUnits } from './weatherUnits.js';
import { LanguageCode } from './languageCode.js';
import { Coordinate } from './coordinate.js';
import { OneCallResponse } from './oneCall.js';

export class OpenWeatherAPI
{
	public APIKey: string;
	public static readonly APIVersion = `2.5`;

	/**
	 *
	 */
	constructor(key: string = ``)
	{
		this.APIKey = key;
	}

	private GetWeatherForecast(location: string, units: WeatherUnits, languageCode: LanguageCode) 
		: Promise<OneCallResponse>
	{
		var url = `https://api.openweathermap.org/data/${OpenWeatherAPI.APIVersion}/onecall?` +
		location +
		`&units=${WeatherUnits[units].toLowerCase()}` +
		`&lang=${LanguageCode[languageCode].toLowerCase()}` +
		`&appid=${this.APIKey}`;
		return this.GetResponse<OneCallResponse>(url);
	}

	public GetWeatherForecastAsync(latitude: number, longitude: number, 
		units: WeatherUnits = WeatherUnits.Imperial, languageCode: LanguageCode = LanguageCode.EN)
		: Promise<OneCallResponse>
	{
		return this.GetWeatherForecast(`lat=${latitude}&lon=${longitude}`, units, languageCode);
	}

	//#region Current Weather
	private  GetCurrentWeather(location: string, units: WeatherUnits, languageCode: LanguageCode)
		: Promise<CurrentWeather>
	{
		var url = `https://api.openweathermap.org/data/${OpenWeatherAPI.APIVersion}/weather?` +
			location +
			`&units=${WeatherUnits[units].toLowerCase()}` +
			`&lang=${LanguageCode[languageCode].toLowerCase()}` +
			`&appid=${this.APIKey}`;
		return this.GetResponse<CurrentWeather>(url);
	}

	public GetCurrentWeatherByCityAsync(city: string, units: WeatherUnits = WeatherUnits.Imperial,
		languageCode: LanguageCode = LanguageCode.EN)
		: Promise<CurrentWeather>
	{
		return this.GetCurrentWeather(`q=${city}`, units, languageCode);
	}

	public GetCurrentWeatherByIDAsync(cityID: number, units: WeatherUnits = WeatherUnits.Imperial,
		languageCode: LanguageCode = LanguageCode.EN)
		: Promise<CurrentWeather>
	{
		return this.GetCurrentWeather(`q=${cityID}`, units, languageCode);
	}

	public GetCurrentWeatherAsync(latitude: number, longitude: number,
		units: WeatherUnits = WeatherUnits.Imperial, languageCode: LanguageCode = LanguageCode.EN)
		: Promise<CurrentWeather>
	{
		return this.GetCurrentWeather(`lat=${latitude}&lon=${longitude}`, units, languageCode);
	}
	public GetCurrentWeatherByCoordinateAsync(coordinates: Coordinate, 
		units: WeatherUnits = WeatherUnits.Imperial, languageCode: LanguageCode = LanguageCode.EN)
		: Promise<CurrentWeather>
	{
		return this.GetCurrentWeather(`lat=${coordinates.lat}&lon=${coordinates.lon}`, units, languageCode);
	}
	//#endregion

	private async GetResponse<T = string>(url:string): Promise<T>
	{
		let response = await fetch(url);
		let json = await response.json() as T;
		return json;
	}
}