# Timeshift Radio Player (Radio BOB! Edition)

Eine moderne, responsive Progressive Web App (PWA), die zeitversetztes Hören (**Timeshift** wie beim Videorekorder) für Internetradio-Streams von **Radio BOB!** ermöglicht. Entwickelt mit Vanilla JavaScript, der Web Audio API und IndexedDB, nimmt die App den Live-Audio-Stream in Echtzeit lokal in kleinen Abschnitten (Chunks) auf. Dadurch kannst du das laufende Radio BOB!-Programm nahtlos pausieren, zurückspulen, vorspulen und fortsetzen.


**Demo:** **[https://ahrenstk.github.io/Radio-Bob-timeshift-radio-player](https://ahrenstk.github.io/Radio-Bob-timeshift-radio-player)**


![Radio BOB! Timeshift Radio Player](https://raw.githubusercontent.com/ahrenstk/Radio-Bob-timeshift-radio-player/main/Radio-Bob-timeshift-radio-player.jpg)

---

## Übersicht

Im Gegensatz zu herkömmlichen Webradio-Playern, die Live-Audio lediglich über einfache HTML5-`<audio>`-Tags abspielen, lädt der **Timeshift Radio Player** kontinuierlich die Rohdaten des Radio BOB!-Streams, synchronisiert MPEG-Frames, unterteilt das Audio in Segmente und speichert diese dauerhaft im Browserspeicher (`IndexedDB`).

Egal ob du kurz vom Schreibtisch aufstehen musst, einen Songtitel oder die Rock-News verpasst hast oder gecachte Abschnitte überspringen möchtest – dieser Player gibt dir die volle Kontrolle über den Live-Stream.

Ich habe diese Software speziell für Bahnfahrten entwickelt: Mit etwa 15 Minuten Vorlauf baut sie genügend Puffer auf, um selbst längere Funklöcher auf ein- bis zweistündigen Strecken mühelos zu überbrücken.

---

## Hauptfunktionen

- **Echtes Timeshift-Playback**: Pausiere Radio BOB! live, spule in festen Schritten (1 Segment (meistens eine Minute) oder 10 Segmente (meinstens 10 Minuten)) vor und zurück.
- **Lokale Zwischenspeicherung**: Audio-Chunks werden lokal in der **IndexedDB** gespeichert. So überstehen Pufferungen auch kurze Netzwerkausfälle oder Reconnects.
- **Low-Level MPEG-Frame-Parsing**: Ein eigener Stream-Parser prüft MPEG-Sync-Words, Frame-Header, Bitraten und Abtastraten, um saubere, unbeschädigte Segmentgrenzen zu garantieren.
- **Smarte Wiederverbindung & Überlappungserkennung**: Verwendet Frame-Signaturen am Ende eines Segments, um doppelte Audioabschnitte beim erneuten Verbinden zu erkennen und zu eliminieren.
- **Live- & Timeshift-Modus**: Wechsle sofort zwischen direktem, latenzarmem Live-Streaming und der Timeshift-Puffer-Wiedergabe.
- **Automatische Löschung**: Beim Aufruf des Programms wird die Aufnahme auf zwei Stunden gekürzt.
- **Interaktive Benutzeroberfläche**:
  - Geteilte Puffer-Zeitleiste, die sowohl den vergangenen (rückspulbaren) als auch den zukünftigen (gepufferten) Speicherbereich anzeigt (jeweils eine Stunde).
  - Lautstärkefunktion, die leider aufgrund der Übersteuerung einiger Radiosender nicht optimal ist
  - Sleeptimer mit automatischer Stream-Abschaltung (Zeitinervall eine Stunde).
  - Aufnahmefunktion (Stop / Record) mit Slider, um versehentliche Aufnahmen oder Stop der Aufnahme zu verhindern
- **Systemintegration**:
  - **Media Session API**: Steuerung im Sperrbildschirm sowie Anzeige des aktuellen Stream-Status auf Smartphones und Desktops.
  - **Screen Wake Lock**: Verhindert, dass das Gerät während des Hörens in den Ruhezustand wechselt.
  - **PWA-Ready**: Enthält Manifest-Konfiguration und Service-Worker-Registrierung zur Installation als Progressive Web App.

---


### Voraussetzungen

Du benötigst lediglich einen modernen Webbrowser mit Unterstützung für:
- Web Audio API
- IndexedDB
- ES6 JavaScript
- MediaStream / Fetch Streaming

### Installation & Lokaler Aufruf

1. Kopiere die Datei `index.html` und passe die Einstellungen nach Bedarf an.
2. Kopiere alle Projektdateien in einen gemeinsamen Ordner auf deinem Webserver, um die Anwendung als Progressive Web App (PWA) nutzen zu können
   
---

## Datenschutzhinweis

Durch die Nutzung dieser Anwendung werden Daten (wie Audio-Chunks und Sender-Voreinstellungen) lokal auf deinem Endgerät gespeichert. Es werden keine personenbezogenen Daten an externe Server übertragen, ausgenommen die direkte Verbindung zu den Stream-Servern von Radio BOB!. Diese Anwendung ist ausschließlich für den privaten Gebrauch bestimmt, da kein aktiver Datenschutzhinweis oder Einwilligungsmechanismus vor dem Speichern der Daten im Browser integriert ist. Für andere Zwecke beachte bitte den Datenschutz und die Information an die Benutzer vor Aufruf der Anwendung.

---

## Konfiguration

Du kannst die verfügbaren Radio BOB!-Streams direkt im Konstruktor der `App`-Klasse innerhalb des Scripts anpassen. Natürlich kannst du auch Sender nutzen, die nicht von **Radio BOB!** stammen.

```javascript
this.livestations = [
    { name: "BOB! & Best of Rock", url: "dynamic" }, 
    { name: "BOB! & Best of Rock AAC", url: "dynamic_aac" },
    { name: "RADIO BOB!", url: "https://streams.radiobob.de/bob-national/mp3-128/streams.radiobob.de" },
    { name: "RADIO BOB! AAC", url: "https://streams.radiobob.de/bob-national/aac-64/streams.radiobob.de" },
];
```

Die ersten beiden Einträge entsprechen den unten aufgeführten dynamischen URLs (`t1`, `t2`, `t3`, `t4`). Die Software wechselt automatisch zu den Minuten **:03, :27, :33 und :57** jeder Stunde zwischen den Streams um Werbung und Nachrichten zu umgehen. Falls diese Umschaltlogik nicht gewünscht ist, muss sie im Code manuell deaktiviert oder entfernt werden.

```javascript
this.stations = [
    { name: "RADIO BOB! Livestream", url: "https://streams.radiobob.de/bob-national/mp3-128/streams.radiobob.de", bitrate: 128000 },
    { name: "RADIO BOB! Best of Rock", url: "https://streams.radiobob.de/bob-bestofrock/mp3-128/streams.radiobob.de", bitrate: 128000 },
];
```
> **Wichtig**: Es können für die Aufnahme nur **MP3-Streams** verwendet werden. Bitte achte zudem darauf, dass die korrekte Bitrate angegeben ist.

```javascript
this.dynamicUrls = {
    t1: "https://streams.radiobob.de/bob-national/mp3-128/streams.radiobob.de",
    t2: "https://streams.radiobob.de/bob-bestofrock/mp3-128/streams.radiobob.de",
    t3: "https://streams.radiobob.de/bob-national/aac-64/streams.radiobob.de",
    t4: "https://streams.radiobob.de/bob-bestofrock/aac-64/mediaplayer"
};
```
Dynamische URLs für den automatischen Wechsel zu den Minuten :03, :27, :33 und :57 jeder Stunde.

> **Hinweis zu Audio-Streams**: Web-Radio-Streams müssen Cross-Origin Resource Sharing (CORS) Header (`Access-Control-Allow-Origin: *`) unterstützen, damit die `fetch()`-API des Browsers die Rohdaten auslesen und in Chunks unterteilen kann.


---

## Lizenz

Dieses Projekt steht unter der **MIT-Lizenz**. Weitere Details findest du in der Datei `LICENSE`.
