import { BrowserNotificationManager } from './Implementations/BrowserNotificationManager.js';

export interface INotificationManager
{
	PushNotification(title:string, message:string): void;
}

export let NotificationManager: INotificationManager;

document.addEventListener("deviceready", () =>
{
	if(cordova.platformId === "browser")
	{
		NotificationManager = new BrowserNotificationManager();
	}
	else if(cordova.platformId === "Android")
	{

	}
}, false);