*Dutch version below*

### English Version

# Spotify Janitor

Spotify Janitor is a web application built to help you manage and clean up your Spotify library. It allows you to log in with your Spotify account, retrieve your saved tracks (complete with album artwork, title, artist, etc.), and search through your saved tracks by artist or track title. The app also lets you swipe a track to the right to remove it from your saved tracks, and it shows an undo button so you can quickly re-add a track if needed. Additionally, the app saves your login so you don’t have to sign in every time, and it features a profile screen where you can view your profile image, premium status, name, country, etc. You can also search the entire Spotify library by title or artist and save a track by pressing a "add" button on the search results.

## Table of Contents
1. Setup
2. Technologies and Libraries
3. Challenges and Hard Choices

## Setup

After cloning the repository, you have two ways to run Spotify Janitor on Android.

### Option 1: Install the Prebuilt Production APK

A production build of the APK has already been pushed to the repository. Follow these steps to install it using ADB:

1. **Clone the repository:**  
   ```git clone https://github.com/Temojikato/spotifyjanitornative.git  ``` <br>
   ```cd spotifyjanitor```

2. **Prepare Your Android Device/Emulator:**

    Using an Emulator: Open Android Studio, launch an Android Virtual Device (AVD), or use your preferred emulator.
    Using a Physical Device: Connect your device via USB and ensure USB debugging is enabled.

3. **Install the APK via ADB:**
    In the terminal you used before run:

    ```adb install app-release.apk```


Once installed, the app should launch on your device or emulator.

### Option 2: Run in Development Mode

For development and testing, you can run the app using the React Native CLI:

1. **Clone the repository:**  
   ```git clone https://github.com/Temojikato/spotifyjanitornative.git  ``` <br>
   ```cd spotifyjanitor```

2. **Install Dependencies:**

    ```yarn install```
    
    or if you prefer npm:
    
    ```npm install```

3. **Start Metro (Development Server):**

    ```npx react-native start```

4. **Build and Run the App on Android: In another terminal, run:**

    ```npx react-native run-android```

This will build the app and launch it on your connected Android device or emulator.

### Tools and IDE Recommendations

    ADB:
    Use the ADB tool included with the Android SDK Platform Tools. You can install these via Android Studio or download them directly from Google.

    Android Studio:
    Android Studio is highly recommended for Android development. It provides an integrated terminal for running ADB commands and managing your Android Virtual Devices.

    Code Editor:
    Use Visual Studio Code (or any preferred editor) to work on your code. Make sure your project’s directory contains a valid package.json and tsconfig.json so that TypeScript and module resolution work correctly.

Remember: The production APK is fully built and pushed to the repository, so you only need to download the repo and run the adb install command for a production version. However, if you want to work on the code and see changes live, use the development mode setup.

Note: iOS testing is not available because I do not have a Mac environment.

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your development app — you can also build it directly from Android Studio or Xcode.

## Stack and Libraries

I built Spotify Janitor using React and TypeScript, which provide a modern, component-based architecture and strong type safety. Since there was no specification and you were interested in my thought process, I relied on my own knowledge to decide. I considered Angular, but it just wouldn’t make sense for this project. Angular is meant for full-stack solutions where everything is under one roof. In this case, however, by design the app will never need such features and React keeps it lightweight with simpler libraries. I used Material-UI (MUI) to create a sleek, responsive UI with a rich set of pre-built components. Axios is used for HTTP requests to the Spotify API because of its promise-based design and ease of use. CRACO allowed us to customize the default Create React App configuration (especially for Babel and Jest) without ejecting, which was essential for handling module transformations. Our testing stack includes Jest and React Testing Library, ensuring that our tests simulate user interactions accurately. Framer Motion provides smooth animations for modals and interactive elements, and Localforage handles local caching to reduce redundant API calls.

## Challenges and Hard Choices

Spotify Janitor was built using React Native and TypeScript, offering a modern, component-based architecture with robust type safety tailored for mobile development. React Native provides a lightweight framework that enables the creation of high-performance, cross-platform mobile applications—perfect for a project focused solely on managing a Spotify library.

For navigation between screens such as Login, Callback, and Saved Tracks, React Navigation was used to ensure smooth, native-like transitions. User data and authentication tokens are persisted locally using AsyncStorage, while Axios simplifies communication with the Spotify API through its promise-based HTTP requests.

The user interface is enhanced with visual and interactive elements:

    react-native-vector-icons supplies a comprehensive set of icons for a polished look, and
    react-native-linear-gradient is used to add smooth gradient effects.
    react-native-toast-message provides elegant, unobtrusive notifications (complete with undo functionality) that improve the overall user experience.

In essence, the combination of these libraries results in a robust, efficient mobile app that is both easy to maintain and highly responsive—ensuring that users can manage their Spotify library on the go with minimal friction.


<br>  
<br>
<br>
<br>

### Dutch Version

# Spotify Janitor

Spotify Janitor is een webapp die je helpt om je Spotify-bibliotheek te beheren en op te ruimen. Je logt in met je Spotify-account, haalt al je opgeslagen nummers op (met albumhoes, titel, artiest, enzovoort) en kunt zoeken op artiest of nummernaam. Ook kun je een nummer naar rechts swipen om het uit je opgeslagen nummers te verwijderen, en er verschijnt een undo-knop zodat je het snel weer terug kunt zetten als dat nodig is. Bovendien onthoudt de app je login, zodat je niet steeds opnieuw hoeft in te loggen, en er is een profielpagina waar je je profielfoto, premium status, naam, land, enzovoort kunt zien. Daarnaast kun je de hele Spotify-bibliotheek doorzoeken op titel of artiest en een nummer opslaan door op de "toevoegen" knop te drukken in de zoekresultaten.

## Index
1. Setup
2. Stack en Libraries
3. Uitdagingen en Keuzes

## Setup

Na het clonen van de repository heb je twee manieren om Spotify Janitor op Android te draaien.

### Optie 1: Installeer de Prebuilt Production APK

Een productiebuild van de APK is al naar de repository gepusht. Volg deze stappen om hem te installeren met ADB:

1. **Clone de repository:**  
   ```git clone https://github.com/Temojikato/spotifyjanitornative.git  ``` <br>
   ```cd spotifyjanitor```

2. **Bereid je telefoon of emulator voor :**

   Emulator gebruiken: Open Android Studio, start een Android Virtual Device (AVD) of gebruik je favoriete emulator.
   Fysiek apparaat gebruiken: Sluit je apparaat via USB aan en zorg dat USB debugging aanstaat.

3. **Install the APK via ADB:**
   In the terminal you used before run:

   ```adb install app-release.apk```


Zodra de app geïnstalleerd is, zou hij automatisch op je apparaat of emulator moeten starten.

### Optie 2: Run in Development Mode

Voor ontwikkeling en testen kun je de app starten via de React Native CLI:

1. **Clone de repository:**  
   ```git clone https://github.com/Temojikato/spotifyjanitornative.git  ``` <br>
   ```cd spotifyjanitor```

2. **Installeer Dependencies:**

   ```yarn install```

   of als je liever npm gebruikt:

   ```npm install```

3. **Start Metro (Development Server):**

   ```npx react-native start```

4. **Build en Run de App op Android: In een nieuwe terminal, run:**

   ```npx react-native run-android```

Dit zal de app bouwen en op je verbonden Android-apparaat of emulator starten.

### Tools en IDE Suggesties

ADB:
Gebruik de ADB-tool die bij de Android SDK Platform Tools zit. Je kunt deze via Android Studio installeren of direct van Google downloaden.

Android Studio:
Android Studio wordt sterk aanbevolen voor Android-ontwikkeling. Het biedt een geïntegreerde terminal om ADB-commando's uit te voeren en je Android Virtual Devices te beheren.

Code Editor:
Gebruik Visual Studio Code (of een andere editor naar keuze) om aan je code te werken. Zorg dat de map van je project een geldig package.json en tsconfig.json bevat, zodat TypeScript en module-resolutie correct werken.

Onthoud: de productie-APK is volledig gebouwd en naar de repository gepusht, dus je hoeft alleen de repo te downloaden en het adb install-commando uit te voeren voor een productieversie. Wil je echter aan de code werken en de veranderingen live zien, gebruik dan de development mode setup.

Opmerking: iOS-testen is niet beschikbaar omdat ik geen Mac-omgeving heb.

Als alles goed is ingesteld, zou je je nieuwe app moeten zien draaien in de Android Emulator, iOS Simulator of op je verbonden apparaat.

Dit is één manier om je development app te draaien — je kunt hem ook direct bouwen vanuit Android Studio of Xcode.


## Stack en Libraries

Ik heb Spotify Janitor gebouwd met React en TypeScript, die zorgen voor een moderne, componentgebaseerde architectuur en sterke typeveiligheid. Omdat er geen specificatie was en je benieuwd was naar mijn gedachtegang, heb ik mijn eigen kennis gebruikt om beslissingen te nemen. Angular heb ik overwogen, maar dat zou voor dit project gewoon niet logisch zijn. Angular is bedoeld voor full-stack oplossingen waarbij alles onder één dak zit. In dit geval heeft de app zulke functies namelijk nooit nodig en houdt React het licht met eenvoudigere libraries. Ik heb Material-UI (MUI) ingezet om een strak, responsief design te maken met een uitgebreide set vooraf gebouwde componenten. Axios gebruik ik voor HTTP-verzoeken naar de Spotify API, vanwege het promise-gebaseerde ontwerp en het gebruiksgemak. CRACO stelde ons in staat om de standaard Create React App-configuratie (vooral voor Babel en Jest) aan te passen zonder te ejecten, wat essentieel was voor het verwerken van moduletransformaties. Onze teststack bestaat uit Jest en React Testing Library, zodat de tests gebruikersinteracties nauwkeurig nabootsen. Framer Motion zorgt voor vloeiende animaties bij modals en interactieve elementen, en Localforage regelt de lokale caching om onnodige API-aanroepen te verminderen.

## Uitdagingen en Keuzes

Spotify Janitor is gebouwd met React Native en TypeScript en biedt zo een moderne, componentgebaseerde architectuur met robuuste typeveiligheid, helemaal afgestemd op mobiele ontwikkeling. React Native levert een lichtgewicht framework waarmee je high-performance, cross-platform mobiele apps kunt maken – perfect voor een project dat zich uitsluitend richt op het beheren van een Spotify-bibliotheek.

Voor de navigatie tussen schermen zoals Login, Callback en Saved Tracks is React Navigation gebruikt, zodat de overgangen soepel en native aanvoelen. Gebruikersgegevens en authenticatietokens worden lokaal opgeslagen met AsyncStorage, terwijl Axios de communicatie met de Spotify API vereenvoudigt dankzij promise-gebaseerde HTTP-verzoeken.

De gebruikersinterface is extra opgefleurd met visuele en interactieve elementen:
• react-native-vector-icons levert een uitgebreide set iconen voor een verzorgde uitstraling,
• react-native-linear-gradient voegt vloeiende gradient-effecten toe, en
• react-native-toast-message zorgt voor elegante, niet-opdringerige meldingen (met undo-functionaliteit) die de algehele gebruikerservaring verbeteren.

Kortom, de combinatie van deze libraries resulteert in een robuuste, efficiënte mobiele app die zowel makkelijk te onderhouden als zeer responsief is – zodat gebruikers hun Spotify-bibliotheek onderweg met minimale moeite kunnen beheren.