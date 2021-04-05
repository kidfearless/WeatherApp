import { DebugConfig } from './Implementations/DebugConfig.js';
import { BrowserConfig } from './Implementations/BrowserConfig.js';
import { DEBUG } from './app.js';
export interface IConfig
{
	Get<T>(source: string): T;
	Get<T>(source: string, defaultValue: T | null): T;
	Set(source: string, value: any): void;
}

export var Config: IConfig;

if (DEBUG)
{
	Config = new DebugConfig();
}
else
{
	Config = new BrowserConfig();
}

// it looks like cordova uses the same properties and methods for storing stuff as the browser so this stuff wasn't needed.
// document.addEventListener("deviceready", () =>
// {
// 	if (DEBUG)
// 	{
// 		Config = new DebugConfig();
// 		return;
// 	}

// 	// @ts-ignore
// 	if (cordova.platformId === "browser")
// 	{
// 		Config = new BrowserConfig();
// 	}
// 	// @ts-ignore
// 	else if (cordova.platformId === "Android")
// 	{
// 		// 
// 		Config = new BrowserConfig();
// 	}
// }, false);



