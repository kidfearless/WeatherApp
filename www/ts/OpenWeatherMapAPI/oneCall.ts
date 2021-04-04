export interface OneCallResponse
{
	lat: number;
	lon: number;
	timezone: string;
	timezone_offset: number;
	current: WeatherReport;
	hourly: WeatherReport[];
}

export interface WeatherReport
{
	dt: number;
	sunrise?: number;
	sunset?: number;
	temp: number;
	feels_like: number;
	pressure: number;
	humidity: number;
	dew_point: number;
	clouds: number;
	visibility?: number;
	wind_speed: number;
	wind_deg: number;
	weather: Weather[];
	wind_gust?: number;
}

export interface Weather
{
	id: number;
	main: string;
	description: string;
	icon: string;
}
