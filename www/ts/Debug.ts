import { DEBUG } from "./app.js";


export class Debug
{
	private static Console:HTMLPreElement;
	public static WriteLine(message?: any, ...optionalParams: any[]): void
	{
		if (DEBUG)
		{
			if(!Debug.Console)
			{
				Debug.Console = document.getElementById("ConsoleElement") as HTMLPreElement;
			}
			if(Debug.Console)
			{
				Debug.Console.innerText += message + "\n";
			}

			console.log(message, optionalParams);
		}
	}
}
