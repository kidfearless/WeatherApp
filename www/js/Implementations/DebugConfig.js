export class DebugConfig {
    constructor() {
        this.Dict = new Map();
    }
    Get(source, defaultValue = null) {
        if (this.Dict.has(source)) {
            return JSON.parse(this.Dict.get(source));
        }
        if (defaultValue) {
            this.Dict.set(source, JSON.stringify(defaultValue));
        }
        return defaultValue;
    }
    Set(source, value) {
        this.Dict.set(source, JSON.stringify(value));
    }
}
//# sourceMappingURL=DebugConfig.js.map