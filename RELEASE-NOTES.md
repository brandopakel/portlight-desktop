# Portlight Desktop 0.1.0-alpha.1

First public prerelease of an independent Windows integration based on Overdrive, using separately installed AnyPS5 tools.

## Included

- Portable Windows x64 Electron app with Portlight branding and upstream credits.
- Configure AnyPS5, clean ELF preparation, resource copying, executable attachment and launch diagnostics.
- Prepare and Launch controls for every catalog entry, including imported catalogs.
- Full 2,069-entry catalog with original cover, hero, logo and screenshot links, including 13 homebrew listings with historical test outcomes.
- Complete launcher source, dependency lockfile, tests, build/packaging scripts, licenses and checksums.

## Observed compatibility

The earlier local integration rendered DOOM menus/3D world, with physical keyboard response confirmed by the tester; ccleste reached its first level. Ten homebrew executables converted in batch. See docs/COMPATIBILITY.md for precise per-title outcomes. No complete game compatibility claim is made.

## Setup and limits

Supply AnyPS5's Windows relinker and matching runtime separately. Supply game files separately. This download does not contain AnyPS5 binaries, game binaries, console modules. The executable is unsigned. Games open in a separate native window, and closing the launcher does not terminate them.

The Windows ZIP, matching source ZIP and SHA256SUMS.txt are provided together. Artwork loads from its original HTTPS hosts and requires internet access.
