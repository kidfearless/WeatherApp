import { INotificationManager } from "../INotificationManager.js";

export class BrowserNotificationManager implements INotificationManager
{
	private static IsCapable: null | boolean = null;
	private static async NullFunc (title: string, message: string){}
	private async pushNotification(title: string, message: string)
	{
		// Let's check whether notification permissions have already been granted
		if (Notification.permission === "granted")
		{
			let param: NotificationOptions = {
				body: message,
			};

			// If it's okay let's create a notification
			var notification = new Notification(title, param);
		}
	}
	async PushNotification(title: string, message: string)
	{
		// do checks if we are capable, if we aren't just nullop the function
		if(BrowserNotificationManager.IsCapable === null)
		{
			BrowserNotificationManager.IsCapable = ("Notification" in window);
			if(!BrowserNotificationManager.IsCapable)
			{
				this.PushNotification = BrowserNotificationManager.NullFunc;
				return;
			}
		}

		if(Notification.permission === "default")
		{
			await Notification.requestPermission();
		}
		
		// now that we've verified that we are capable, and have requested permissions,
		// we can just validate if we have permissions or not in the simplied function.

		this.PushNotification = this.pushNotification;
		this.pushNotification(title, message);
		return;
	}
}