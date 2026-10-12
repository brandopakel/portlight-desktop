# Third-party notices and distribution scope

The root source LICENSE is GPL version 3. Source inherited from Overdrive is GPL-3.0-or-later with its applicable attribution-preservation term. Portlight-authored additions are GPL-3.0-or-later. Preserve LICENSE-ATTRIBUTION with redistributions.

The portable Windows package retains Electron's own root LICENSE and LICENSES.chromium.html. Portlight's GPL text is named PORTLIGHT-LICENSE.txt in that package to avoid overwriting Electron's license.

`licenses/npm-components.json` in the Windows package records the locked production dependency versions and declared licenses. The corresponding complete package license/notice files are copied under `licenses/npm/`. Packaging fails when a production dependency lacks a discoverable license file; dependency changes require review. Electron's Chromium/Node notices and the Geist OFL are included separately.

Build-only tools are declared in package.json and package-lock.json; their installed node_modules are not included in the source ZIP. The source and exact lockfile accompany this release, along with all scripts needed to build the launcher. Source and binary ZIPs should always be published together.

The react-remove-scroll-bar 2.3.8 npm package declares MIT but omits its license file. Its upstream MIT notice was retrieved on 2026-10-12 from https://raw.githubusercontent.com/theKashey/react-remove-scroll-bar/master/LICENSE and is included explicitly under licenses/. This documented exception is version-specific in the packaging script.

AnyPS5 is invoked as a separate executable, supplied by the user, under GPL-2.0-only. No AnyPS5 executable, runtime library, source code or patch is bundled in this public package. This preserves a separate tool boundary; there is no attempt to combine the two projects under a single license.

Catalog metadata is preserved from the local Overdrive v0.2.3-derived catalog, augmented with homebrew project listings from homebrew.page and their upstream repositories. Cover, hero, logo and screenshot URLs retain their original hosts; image files are fetched by the app and are not embedded in the release. Descriptions, names and artwork remain attributable to their respective publishers and creators; Portlight does not claim ownership or relicense third-party catalog content under its software GPL. Overdrive documents its catalog as a separate repository, so its source-code license is not presented as a blanket license for that content. Downloaded game files, console modules, recovery outputs, firmware and keys are not included.
