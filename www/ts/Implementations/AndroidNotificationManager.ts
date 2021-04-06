
import { INotificationManager } from "../INotificationManager.js";

export class AndroidNotificationManager implements INotificationManager
{
	PushNotification(title: string, message: string): void
	{
		// we don't really have a good way to import the plugins right now
		// we we're just going to js this stuff up.
		// @ts-ignore
		cordova.plugins.notification.local.schedule({
			title: title,
			text: message,
			foreground: true
		});
	}

}