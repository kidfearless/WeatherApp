
// geolocation defines all the properties in the prototype or something, so we can stringify it.
export function Clone(position : GeolocationPosition)
{
	return {
		coords: {
			accuracy: position.coords.accuracy,
			altitude: position.coords.altitude,
			altitudeAccuracy: position.coords.altitudeAccuracy,
			heading: position.coords.heading,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			speed: position.coords.speed,
		},
		timestamp: position.timestamp,
	}
}