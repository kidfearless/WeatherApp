import { DebugConfig } from './Implementations/DebugConfig.js';
import { BrowserConfig } from './Implementations/BrowserConfig.js';
import { DEBUG } from './app.js';
export interface IConfig
{
	Get<T>(source: string): T;
	Get<T>(source: string, defaultValue: T|null): T;
	Set(source: string, value: any): void;
}

export let Config: IConfig;

document.addEventListener("deviceready", () =>
{
	if(DEBUG)
	{
		Config = new DebugConfig();
		return;
	}

	// @ts-ignore
	if(cordova.platformId === "browser")
	{
		Config = new BrowserConfig();
	}
	// @ts-ignore
	else if(cordova.platformId === "Android")
	{

	}
}, false);



