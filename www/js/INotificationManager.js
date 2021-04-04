import { BrowserNotificationManager } from './Implementations/BrowserNotificationManager.js';
export let NotificationManager;
document.addEventListener("deviceready", () => {
    if (cordova.platformId === "browser") {
        NotificationManager = new BrowserNotificationManager();
    }
    else if (cordova.platformId === "Android") {
    }
}, false);
//# sourceMappingURL=INotificationManager.js.map