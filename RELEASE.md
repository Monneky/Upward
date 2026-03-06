# How to Release Norte (Upward)

## Trigger a Release

1. **Update the version** in `package.json` to match your release (e.g. `1.0.0`).

2. **Create and push a tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions** will automatically:
   - Run on `macos-latest`
   - Install dependencies with `npm ci`
   - Build the Electron app with `npm run build:mac`
   - Create a GitHub Release from the tag
   - Upload the `.dmg` files (Intel x64 and Apple Silicon arm64) as release assets

## Build Output

- **Target:** DMG for Mac
- **Architectures:** x64 (Intel) and arm64 (Apple Silicon)
- **Publisher:** GitHub (for auto-updater integration)

## Local Build (optional)

To build locally:

```bash
npm ci
npm run build
electron-builder --mac
```

Output will be in the `dist/` directory.

## Mac Notarization (future)

For distribution outside the Mac App Store, Apple requires notarization. Setup is commented out in `electron-builder.yml`. When ready:

1. Install `@electron/notarize`:
   ```bash
   npm install -D @electron/notarize
   ```

2. Create `scripts/notarize.js` that calls the notarize API with your Apple credentials.

3. Uncomment the `notarize` and `afterSign` config in `electron-builder.yml` and set your Apple Team ID.

4. Set `APPLE_ID` and `APPLE_APP_SPECIFIC_PASSWORD` as GitHub secrets for the workflow.
