# KiD's Weather App

This repository is to save and track my progress on this personal app of mine. The app currently alerts me when the temperature is cool/warm enough for me so that I'm not sweating/freezing for the next hour or so. It's also good practice for learning Cordova and practicing using interfaces whenever possible. It's currently being developed on the browser but If I've interfaced out all the important parts then I'll only need to change a few things when switching over to android. I don't plan on writing anything for desktop or apple, but I will eventually add some stuff to make it a PWA at some point. Along with some other fitness reminder features.

## Installation-Browser
1. Clone the repository or download
2. `npm i`
3. Create a Secrets.ts in `www/ts/` with your api key inside it `export  const  OpenWeathApiKey = "YOUR KEY HERE";`
4. Compile the typescript either using visual studio code or the command line.
5. Run the server from `www` I use the live server extension during testing.

## Installation-Android
Follow the above steps and [Cordova's Getting Started Guide For Android](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) in the mean time.
