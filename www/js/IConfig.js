import { DebugConfig } from './Implementations/DebugConfig.js';
import { BrowserConfig } from './Implementations/BrowserConfig.js';
import { DEBUG } from './app.js';
export let Config;
document.addEventListener("deviceready", () => {
    if (DEBUG) {
        Config = new DebugConfig();
        return;
    }
    if (cordova.platformId === "browser") {
        Config = new BrowserConfig();
    }
    else if (cordova.platformId === "Android") {
    }
}, false);
//# sourceMappingURL=IConfig.js.map