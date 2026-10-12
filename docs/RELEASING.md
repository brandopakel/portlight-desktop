# Release procedure

1. Update package.json and package-lock.json versions together. Update release notes and measured compatibility results.
2. On Windows x64 with Node 24, run `npm ci`, `npm test`, `npm run build`, `npm run package`, and `npm run verify`.
3. Test the staged app with a fresh Windows user profile: catalog browsing, configuration cancellation, AnyPS5 selection, invalid ELF handling, one real preparation and launch, and catalog import. Document the machine and exact versions. Do not label a process-start test as gameplay verification.
4. ZIP the entire `release/Portlight-VERSION-windows-x64` folder. Include all Electron files and notices, not only Portlight.exe.
5. Export the tagged source with `git archive --format=zip --prefix=Portlight-VERSION-source/ -o Portlight-VERSION-source.zip TAG`. This includes source, lockfile, notices and scripts without node_modules, user data or local history.
6. Generate SHA-256 hashes for both ZIPs and publish them in SHA256SUMS.txt.
7. Create a GitHub prerelease using RELEASE-NOTES.md and attach all three assets. Keep the source ZIP publicly accessible alongside every binary release.

The included manually triggered Windows workflow builds and verifies artifacts; it does not publish a release or push commits. Repository publication and release creation are separate deliberate actions.

After committing the reviewed source, `node scripts/archive.cjs` automates steps 4–6 from HEAD and refuses a dirty working tree or existing archive names.

For an initial repository without an author identity or commit, stage all reviewed files and run `node scripts/archive.cjs --staged`. It archives the exact staged Git tree, rejects unstaged/untracked source, and records its tree ID in SOURCE-REF.txt. This creates no fabricated commit identity; the owner can make the first commit when publishing.

First release is unsigned. Do not claim code signing, SmartScreen reputation, antivirus certification, an exhaustive license audit, or validation on a clean second PC unless those checks have actually been completed.

Excluded from source and binary packages: local games, downloaded archives, recovered ELF/PRX modules, personal absolute paths, credentials, caches and test-user settings.
