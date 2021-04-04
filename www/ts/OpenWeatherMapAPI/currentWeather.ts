import { Coordinate } from './coordinate.js';
import { Weather } from './weather.js';
import { MainWeather } from './mainWeather.js';
import { System } from './system.js';
import { Wind } from './wind.js';
import { Clouds } from './clouds.js';
export interface CurrentWeather {
	dt: number;
	coord: Coordinate;
	weather: Weather[];
	main: MainWeather;
	visibility: number;
	wind: Wind;
	clouds: Clouds;
	sys: System;
	timezone: number;
	id: number;
	name: string;
}