import { BrowserNotificationManager } from './Implementations/BrowserNotificationManager.js';
import { AndroidNotificationManager } from './Implementations/AndroidNotificationManager.js';
import { Debug } from './Debug.js';

export interface INotificationManager
{
	PushNotification(title:string, message:string): void;
}

export let NotificationManager: INotificationManager;

document.addEventListener("deviceready", () =>
{
	Debug.WriteLine(`Device is ${cordova.platformId}`);

	if(cordova.platformId === "browser")
	{
		NotificationManager = new BrowserNotificationManager();
	}
	else if(cordova.platformId === "android")
	{
		NotificationManager = new AndroidNotificationManager();
	}
});