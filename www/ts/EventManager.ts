export type EventListenerCallback<T = undefined> = (data?:T) => void

export class EventManager<T = undefined>
{
	Events: EventListenerCallback<T>[];

	constructor()
	{
		this.Events = [];
	}

	public Add(callback: EventListenerCallback<T>): void
	{
		this.Events.push(callback);
	}

	public Remove(callback: EventListenerCallback<T>): void
	{
		const index = this.Events.indexOf(callback);
		if (index > -1)
		{
			this.Events.splice(index, 1);
		}
	}

	public Invoke(data?: T)
	{
		this.Events.forEach(callback =>
		{
			callback(data);
		});
	}
}
