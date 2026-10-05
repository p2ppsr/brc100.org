# BRC100.org

The developer home for BRC-100, the standard interface between BSV applications and wallets. Live at https://brc100.org.

## Contribute and reuse

The website is source-available under the [Open BSV License Version 6](LICENSE.txt). The Manrope font retains its separate SIL Open Font License; see [third-party notices](THIRD_PARTY_NOTICES.md).

To list a wallet or app, edit `data/directory.json`, run `npm run directory`, and open a pull request. The [contribution guide](CONTRIBUTING.md) explains the entry format and review process. Names are alphabetical; the BSV Association reference wallets appear first. PR checks run without deployment credentials.

## Website

The static frontend includes an animated interface diagram, six interactive SDK examples with TypeScript/request/response views, message editing, clipboard controls, a getting-started guide, primary reference links, wallet/app directories, and accessible FAQs. Examples are rendered locally: the site never connects to a wallet, submits transactions, or sends visitor input to a server. Response shapes are illustrative. Example compatibility is checked against the pinned SDK in development.

Manrope is self-hosted, with its OFL license in `frontend/assets/manrope-license.txt`. No analytics, external fonts, or runtime CDN dependencies are used. Canonical metadata, a social image, robots.txt, and sitemap.xml are included.

## Develop and verify

Use Node 22 or newer.

```sh
npm ci
npx playwright install chromium
npm run dev   # http://127.0.0.1:4179
npm run directory # generate static directory HTML from data/directory.json
npm run check # directory consistency, assets, anchors, syntax, SDK types
npm test      # responsive layouts, controls, clipboard, accessibility, no-JS/reduced-motion
npm run social # regenerate the committed social preview image
npm run build # validation followed by the CARS artifact build
```

Stop the local preview before `npm test`; Playwright starts its own server. To verify a deployed site, use `SITE_URL=https://brc100.org npm test`.

Edit `frontend/` for site changes. `frontend/examples.js` is the single catalog for both the explorer and the SDK type checks. SDK, font, and test dependencies are development-only; they are not shipped to visitors.

## Publish and rollback

Production is `master`. A push or manual workflow dispatch runs `.github/workflows/deploy.yaml`: install the lockfile, validate the site and browser behavior, check the existing deploy identity and balance, build the static HTML artifact, and issue one CARS release. Require the terminal success marker and validate the live site. Concurrency queues releases and never cancels an active deployment. CI does not automatically top up the project.

Project ID: `0481b2b6f9b2d96210fc1a0cab5086b0` on `https://cars.babbage.systems` (mainnet). Release credentials exist only in the repository's `CARS_PRIVATE_KEY` GitHub secret and the private network-ops secrets store. DNS, certificates, availability evidence, and operational procedures are owned by `network-ops`; never add hosting metadata for other providers.

To roll back, revert the frontend change on `master` and push a new CARS release, following the network-ops route-probe and safety gates. Operational release records are maintained privately.
