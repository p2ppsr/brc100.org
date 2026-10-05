# Grow the BRC-100 directory

Add a wallet or app by opening a pull request against `master` in [p2ppsr/brc100.org](https://github.com/p2ppsr/brc100.org). A GitHub account and a fork are enough; deployment access is not needed.

1. Fork the repository and create a branch in your fork.
2. Add an entry under `wallets` or `apps` in `data/directory.json`.
3. Run `npm ci`, `npm run directory`, and `npm run check`. Commit both the data and generated `frontend/index.html`.
4. Open a pull request explaining what the product does and linking to its official integration documentation or public source.

An entry looks like this:

```json
{
  "name": "Example Wallet",
  "vendor": "Example Team",
  "url": "https://example.com/",
  "description": "One short, factual sentence describing the product.",
  "integration": "BRC-100",
  "evidence": "https://example.com/docs/brc100"
}
```

Use the actual product name, an official public HTTPS website or repository, and a short description without advertising claims. `evidence` must point to the vendor's documentation or public code supporting the integration label. Use `BRC-100` only when supported by that evidence; a wallet with a different API can be listed with its actual integration name. Do not assume one wallet supports every app. Apps with a wallet adapter should explain that adapter in their integration guide.

The generator orders names alphabetically, ignoring case. BSV Association reference wallets appear first; `reference: true` is reserved for those implementations. There are no paid placements, popularity rankings, or vendor-specific ordering for other entries. Maintainers review entries, integration claims, links, and corrections before merging. A listing describes a product; it is not a certification of interoperability.

CI checks pull requests without deployment credentials. After review and merge, the existing production pipeline publishes accepted entries.

For interface, styling, or behavior changes, also run `npx playwright install chromium` and `npm test` (stop `npm run dev` first). The generated directory is static HTML, so listings remain visible without JavaScript.

Contributions are offered under the repository's [Open BSV License](LICENSE.txt). Preserve the separate Manrope font license and third-party notices. Do not commit private keys, credentials, personal wallet data, or deployment artifacts.
