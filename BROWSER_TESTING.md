# Browser and Electron development

The game keeps its existing Electron entry point for the desktop/Steam build and also has a local HTTP entry point for normal browsers.

## Desktop / Electron

```powershell
npm start
```

## Local browser

```powershell
npm run start:web
```

Open `http://127.0.0.1:4173/` in a browser. This is also the URL that Codex can inspect when an in-app Browser tab is available.

To choose another port:

```powershell
node browser_server.js --port 8080
```

## Phone or tablet on the same LAN

```powershell
npm run start:web:lan
```

Open `http://<PCのLAN IP>:4173/` from the device. Allowing LAN access through the operating-system firewall may be required.

This browser target is the web foundation for a future Android wrapper. Publishing to Google Play will still require an Android project and an AAB signing/release workflow; those are separate from the Electron/Steam package.
