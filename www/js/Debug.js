import { DEBUG } from "./app.js";
export class Debug {
    static WriteLine(message, ...optionalParams) {
        if (DEBUG) {
            console.log(message, optionalParams);
        }
    }
}
//# sourceMappingURL=Debug.js.map