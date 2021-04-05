import { DEBUG } from "./app.js";
export class Debug {
    static WriteLine(message, ...optionalParams) {
        if (DEBUG) {
            if (!Debug.Console) {
                Debug.Console = document.getElementById("ConsoleElement");
            }
            if (Debug.Console) {
                Debug.Console.innerText += message + "\n";
            }
            console.log(message, optionalParams);
        }
    }
}
//# sourceMappingURL=Debug.js.map