# Catalog import

Import catalog accepts a JSON array of 1–10,000 entries, up to 20 MB. These size bounds and schema checks protect storage and rendering; they are not a compatibility allowlist.

Each entry has string fields `id`, `slug`, `title`, `shortDescription`, `about`, `developer`, `publisher`, `releaseDate`; optional string `platform`; arrays of strings `genres`, `features`, `screenshots`; numeric nonnegative `recommendations`; nullable nonnegative numbers `metacritic`, `ageRating`, `sizeGb`; and an `images` object with `cover`, `hero`, `logo`, `header` strings.

IDs must be unique, 1–80 letters/digits/underscores/hyphens, excluding reserved prototype keys. Slugs must be unique URL-safe letters/digits/underscores/hyphens. Artwork accepts HTTPS URLs, empty strings, or the bundled relative SVG artwork paths. Use an empty logo when no image is available. Dates may be empty; otherwise use YYYY-MM-DD for display.

`catalog/store/games.json` is a complete example. All imported titles receive the same Attach, Prepare and Launch controls. Importing metadata does not attach files or download games.

The default library preserves all 2,069 entries from the local Overdrive-derived catalog, including 13 homebrew listings. Cover, hero, header, logo and screenshot URLs are retained. Artwork is loaded remotely, not replaced with placeholder covers. Catalog presence is independent of AnyPS5 compatibility and does not provide game executables.
