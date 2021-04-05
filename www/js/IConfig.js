import { DebugConfig } from './Implementations/DebugConfig.js';
import { BrowserConfig } from './Implementations/BrowserConfig.js';
import { DEBUG } from './app.js';
export var Config;
if (DEBUG) {
    Config = new DebugConfig();
}
else {
    Config = new BrowserConfig();
}
//# sourceMappingURL=IConfig.js.map