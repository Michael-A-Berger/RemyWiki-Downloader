# RemyWiki-Downloader
A web scrapper for RemyWiki (BEMANI English wiki)

# Current Parsing Status

- :part_alternation_mark: DDR MAX2
    - Haven't tested CSV printing with current parsing algorithm.
    - Probably need to update game testing method.
- :heavy_check_mark: beatmania IIDX 6th style
    - Finds the song links on the full song list page, parses individual song pages, and prints the gathered data to a .CSV file.
- :part_alternation_mark: beatmania IIDX 16 EMPRESS
    - Haven't tested CSV printing with current parsing algorithm.
- :heavy_check_mark: beatmani IIDX 26 Rootage
    - Prints detail information about each song in the game (outside of the Scripted Connection variants)

# TO DO
- Add special case for Scripted Connection variants
    - Need to modify special case method to be able to return multiple songs.
        - ...Or I might be able to push the modified songs onto the Songs array directly.
- Work on parsing song information arrays to single strings
    - Tried to do a lot of this, but it resulted in wonky results and too many errors. By defaul it's disabled.
- Do more extensive DDR song list testing