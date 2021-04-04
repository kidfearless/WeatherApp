var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class BrowserNotificationManager {
    static NullFunc(title, message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    pushNotification(title, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Notification.permission === "granted") {
                let param = {
                    body: message,
                };
                var notification = new Notification(title, param);
            }
        });
    }
    PushNotification(title, message) {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.PushNotification = this.pushNotification;
            this.pushNotification(title, message);
            return;
        });
    }
}
BrowserNotificationManager.IsCapable = null;
//# sourceMappingURL=BrowserNotificationManager.js.map