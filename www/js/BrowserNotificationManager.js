var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BrowserNotificationManager {
    static NullFunc(title, message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    pushNotification(title, message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Let's check whether notification permissions have already been granted
            if (Notification.permission === "granted") {
                let param = {
                    body: message,
                };
                // If it's okay let's create a notification
                var notification = new Notification(title, param);
            }
        });
    }
    PushNotification(title, message) {
        return __awaiter(this, void 0, void 0, function* () {
            // do checks if we are capable, if we aren't just nullop the function
            if (BrowserNotificationManager.IsCapable === null) {
                BrowserNotificationManager.IsCapable = ("Notification" in window);
                if (!BrowserNotificationManager.IsCapable) {
                    this.PushNotification = BrowserNotificationManager.NullFunc;
                    return;
                }
            }
            if (Notification.permission === "default") {
                yield Notification.requestPermission();
            }
            // now that we've verified that we are capable, and have requested permissions,
            // we can just validate if we have permissions or not in the simplied function.
            this.PushNotification = this.pushNotification;
            this.pushNotification(title, message);
            return;
        });
    }
}
BrowserNotificationManager.IsCapable = null;
var NotificationManager = new BrowserNotificationManager();
export { NotificationManager };
//# sourceMappingURL=BrowserNotificationManager.js.map