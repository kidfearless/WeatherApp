import { DEBUG } from "./app.js";


export class Debug
{
	public static WriteLine(message?: any, ...optionalParams: any[]): void
	{
		if (DEBUG)
		{
			console.log(message, optionalParams);
		}
	}
}
