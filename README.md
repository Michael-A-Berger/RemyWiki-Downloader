# RemyWiki-Downloader
A web scrapper for RemyWiki (BEMANI English wiki)

# TO DO
- Add special case for parsing [Timepiece phase II](https://remywiki.com/Timepiece_phase_II) IIDX version (original & CN charts)
    - Unhook parsing logic from song-getting logic in ` parser.js `
    - Add ` linkText ` property to ` getSong() ` in ` parser.js `(neaded b/c HREF attribute doesn't always include reference to CN charts)
    - Finish the special function in ` special-cases.js `
- Add IIDX VJ exceptions list in ` game-tests.js `
    - Mostly to acccount for the 50th Memorial Songs, which define "Movie" instead of "VJ"
    - Either that or add another series-specific IF statement to make sure the property is filled out (see; genre double-check in ` getSong() ` of ` parser.js `)
- Do more extensive DDR song list testing