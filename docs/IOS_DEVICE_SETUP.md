# Firnal — iPhone (Chair Phone) via Xcode

## Prerequisites
- Mac with Xcode
- Chair Phone unlocked, Developer Mode on (Settings → Privacy & Security)
- Trust this computer when prompted
- Same Wi‑Fi as the Mac for LAN dev (`192.168.1.11`)

## Dev run
1. On Mac: `cd ~/Projects/Firnal && npm run dev -- -H 0.0.0.0 -p 3000`
2. Update `capacitor.config.ts` `server.url` if your Mac LAN IP changes (`ipconfig getifaddr en0`)
3. `npx cap sync ios`
4. Open Xcode: `npx cap open ios` (opens `ios/App/App.xcworkspace`)
5. Select device **Chair phone** → Signing & Capabilities → your Team
6. Product → Run

## Notes
- Dev builds load the Next.js app over HTTP on the LAN (cleartext + local networking ATS).
- Release builds should remove `server.url` and ship a production HTTPS origin or static export.
- Microphone permission string is in `Info.plist`.
