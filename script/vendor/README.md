# Locally hosted browser dependencies

These are the same versions used before the security review, copied without modification.

| File | Source | License |
| --- | --- | --- |
| typed-2.1.0.umd.js | https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js | MIT, see typed-LICENSE |
| iconify-3.0.1.min.js | https://code.iconify.design/3/3.0.1/iconify.min.js | MIT, see iconify-LICENSE |

The exact versions are also devDependencies in package.json/package-lock.json, so npm audit
tracks them. Both copies were verified byte-for-byte against the installed npm distribution.
When updating, change the lockfile AND these copies together and review upstream advisories.
Iconify still retrieves icon data from its APIs; the CSP allows those requests but permits
executable scripts only from this site's origin. Iconify's npm package is deprecated; consider
static SVGs or a maintained replacement in a future dependency update.

SHA-256 checksums:

- typed-2.1.0.umd.js: `58424467abb3fa4b302a80c7108fe20ca8328e4ecb4275cf1a04db3fa5f83f27`
- iconify-3.0.1.min.js: `d75fe31fdbf769e092d96491a2de18e738c8bb95a96ba611977d9ea574faa6ae`
