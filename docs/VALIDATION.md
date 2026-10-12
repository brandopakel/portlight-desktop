# Release-candidate validation

Version: 0.1.0-alpha.1. Validation date: 2026-10-12.

- TypeScript compilation and Vite production build passed on Windows x64 using Node 24.
- Six backend tests passed: title-ID handling without a platform allowlist; tool configuration persistence; resource-copy/prepare/visible-launch behavior; invalid input errors; changed-tool detection; and a real Windows process launch/exit.
- Two catalog tests passed: full 2,069-entry catalog and PS4/PS5/custom entries accepted; duplicate IDs, unsafe artwork and invalid field types rejected. Total: eight tests passed.
- The prepare/launch unit test uses a synthetic PE output from a test process adapter. It proves launcher behavior, not AnyPS5 compatibility.
- Earlier real AnyPS5 tests and game observations are separated in COMPATIBILITY.md.

The earlier starter-catalog package opened with a fresh Portlight profile, correct branding, 13 starter entries and no preconfigured AnyPS5 path. Configuration cancellation returned to the usable library. Selecting the locally built AnyPS5 relinker and matching runtime persisted successfully. Clicking Launch on DOOM opened the clean ELF picker, then prepared and launched the supplied local ELF. The separate DOOM window rendered its shareware selection menu. The public package contains none of the files selected during this test; they reside in the tester's separate installation and user profile.

The package verifier checks required notices, file types, personal-path patterns, absence of game packages/user data, and the full 2,069 catalog records, original HTTPS artwork links, and 13 homebrew test reports. The dependency-notice collection includes a documented upstream-license fallback for react-remove-scroll-bar 2.3.8.

The final frontend also omits ranking charts when the catalog has no corresponding ratings/dates/review counts, and only offers Open latest log after a log exists.

This is not a clean second-PC certification, signed release, antivirus certification or full-game validation. The GitHub Actions workflow has been prepared but not run on GitHub. No public repository or release has been created by this local preparation.

Full-catalog rebuild: all eight tests and the TypeScript/Vite production build passed. The packaged app displayed 2,069 entries and rendered original remote cover images, logos and hero artwork. The README screenshot was recaptured from this build. Catalog and homebrew JSON files match the original local catalog byte for byte.
