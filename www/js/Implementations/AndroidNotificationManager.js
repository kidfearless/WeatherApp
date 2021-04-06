export class AndroidNotificationManager {
    PushNotification(title, message) {
        cordova.plugins.notification.local.schedule({
            title: title,
            text: message,
            foreground: true
        });
    }
}
//# sourceMappingURL=AndroidNotificationManager.js.map