# RemyWiki-Downloader
A web scrapper for RemyWiki (BEMANI English wiki)

# Current Parsing Status

- :part_alternation_mark: DDR MAX2
    - Haven't tested CSV printing with current parsing algorithm.
    - Probably need to update game testing method.
- :heavy_check_mark: beatmania IIDX 6th style
    - Finds the song links on the full song list page, parses individual song pages, and prints the gathered data to a .CSV file.
    - (The algorithm can be improved, but testng comes up clean and the resulting CSV is acceptablely coherent.)
- :part_alternation_mark: beatmania IIDX 16 EMPRESS
    - Haven't tested CSV printing with current parsing algorithm.
- :part_alternation_mark: beatmani IIDX 26 Rootage
    - Game test fails, but not due to parsing errors ("Movie" property is set in lieu of "VJ" property).
    - Haven't tested CSV printing with current parsing algorithm.

# TO DO
- Add special case for parsing [Timepiece phase II](https://remywiki.com/Timepiece_phase_II) IIDX version (original & CN charts)
    - Finish the special function in ` special-cases.js `
- Add IIDX VJ exceptions list in ` game-tests.js `
    - Mostly to acccount for the 50th Memorial Songs, which define "Movie" instead of "VJ"
    - Either that or add another series-specific IF statement to make sure the property is filled out (see; genre double-check in ` getSong() ` of ` parser.js `)
- Do more extensive DDR song list testing