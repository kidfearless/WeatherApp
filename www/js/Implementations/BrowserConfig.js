export class BrowserConfig {
    Get(source, defaultValue = null) {
        const item = localStorage.getItem(source);
        if (item != null) {
            return JSON.parse(item);
        }
        if (defaultValue) {
            localStorage.setItem(source, JSON.stringify(defaultValue));
        }
        return defaultValue;
    }
    Set(source, value) {
        localStorage.setItem(source, JSON.stringify(value));
    }
}
export const Config = new BrowserConfig();
//# sourceMappingURL=BrowserConfig.js.map