import { IConfig } from "../IConfig.js";

export class DebugConfig implements IConfig
{
	private Dict: Map<string, string> = new Map<string, string>();
	Get<T = any>(source: string, defaultValue: T|null = null): T
	{
		if (this.Dict.has(source))
		{
			return JSON.parse(this.Dict.get(source) as string) as T;
		}
		if(defaultValue)
		{
			this.Dict.set(source, JSON.stringify(defaultValue));
		}
		return defaultValue as T;
	}
	
	Set(source: string, value: any): void
	{
		this.Dict.set(source, JSON.stringify(value));
	}
}
