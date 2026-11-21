AeroCalc v7.8 — GitHub Pages Offline PWA
==========================================

UPLOAD
1. Extract this ZIP.
2. Upload all files (index.html, sw.js, manifest.webmanifest, icons) to the
   root of your GitHub Pages repository, keeping the same folder structure.
3. Enable GitHub Pages from Settings > Pages.
4. Open the published HTTPS URL while online and wait for the app to load.
5. Open the Navigation tab and move/zoom around the map areas you will need.
   The map tiles you view online are saved for later offline use.
6. On mobile, use the browser's Add to Home Screen / Install option.

OFFLINE MAP LIMITATION
- The app shell and visited Esri World Imagery map tiles are cached.
- Only map tiles actually downloaded while online are available offline.
- The whole map of Egypt is NOT preloaded in this ZIP.
- Connect to the internet before travel, open the map, and visit/zoom into
  every area you expect to use offline.
- The browser may evict cached data under storage pressure; keep the app
  installed and test airplane mode before relying on it.

NOTES
- Service workers require HTTPS (GitHub Pages provides HTTPS).
- The first installation and first map download require internet access.
- Do not rename sw.js or the manifest/icons without updating index.html.
