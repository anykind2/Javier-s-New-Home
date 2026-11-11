# Javier's New Home

A hand-made personal site: 64 songs, nineteen rules, a sketchbook left open, and one very short film. No framework, no build step — plain HTML, CSS, and JavaScript.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, five staff picks, daily truth, sketchbook preview, film, footer |
| `MUSICS.html` | The full 64-song archive with search, filters, sorting, and favorites |
| `DAILY-TRUTH.html` | The nineteen rules, borrowed ideas, rotating quotes, and video |
| `GALLERY.html` | The sketchbook / pinboard with filters and a lightbox |

The player dock is injected on every page, so playback keeps going as you move around the site.

## Files

```
index.html                 home
MUSICS.html                music library
DAILY-TRUTH.html           rules + quotes
GALLERY.html               sketchbook
view-counter.php           tiny PHP visitor counter
assets/css/site.css        the whole design system
assets/js/data.js          tracks, truths, staff picks
assets/js/site.js          nav, filters, gallery, counter, rules
assets/js/player.js        persistent audio player
assets/favicon.svg         cobalt J
Images/                    photos and drawings
Musics/                    the 64 mp3 files
Videoes/                   dragonVSparoit.mp4
```

## Preview locally

Open `index.html` directly, or serve the folder with any static server:

```powershell
# from this folder
python -m http.server 8000
```

Then visit `http://localhost:8000/`. Without PHP the view counter shows an em dash (—); everything else works.

## Adding a song

1. Drop the `.mp3` into `Musics/`.
2. Open `assets/js/data.js` and add one line to `window.JH.tracks`:

```js
{ f: 'New Song.mp3', t: 'New Song', a: 'Artist Name', d: 214, c: 3 },
```

- `f` must match the filename exactly, including case and spaces.
- `t` is the title, `a` the artist, `d` the duration in seconds.
- `c` picks a cover palette, `0`–`9`, from `window.JH.palettes`.
- `JH.librarySeconds` recalculates automatically, so the “3h 41m” totals stay correct.
- Staff picks are the filenames listed in `window.JH.staffPicks`.

To remove a song, delete its line and the file. Nothing else needs changing.

## Editing the words

All copy lives in the page HTML, except the rotating material:

- `window.JH.truths` in `assets/js/data.js` feeds the daily-truth card and the quote rotator.
- The nineteen rules are marked up in `DAILY-TRUTH.html`.
- `window.JH.staffPicks` sets the five songs on the home page.

## The player

- Starts on **Past Lives** by sapientdream, paused at 0:00.
- Bottom dock: play/pause, previous/next, shuffle, repeat, seek, volume, favorites, queue.
- The now-playing panel opens from the dock and shows artwork, queue, and favorite controls.
- Queue comes from the library order; shuffle randomizes it.
- Favorites sync between the dock, the now-playing panel, and the heart buttons in the library.
- Playback position, volume, shuffle, repeat, and favorites survive page changes through `localStorage`:
  - `javier.player.v1` — current track, time, volume, shuffle, repeat
  - `javier.favs.v1` — favorited filenames
  - `javier.rules.v1` — today's rule checklist
  - `javier.theme` — light or dark

Keyboard shortcuts (when not typing in a field):

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `N` / `P` | Next / previous |
| `M` | Mute |
| `S` | Shuffle |
| `←` / `→` | Seek 5 seconds (now-playing panel) |
| `/` | Focus the library search box |
| `Esc` | Close the player or menu |

Browsers block autoplay with sound, so playback always starts from a click.

## The view counter

`view-counter.php` increments a locked text file and returns JSON:

```json
{ "count": 1234 }
```

`assets/js/site.js` fetches that endpoint and falls back to `—` if PHP is missing or the request fails. On a PHP host:

1. Upload `view-counter.php` next to `index.html`.
2. Make sure the folder is writable so PHP can create/update `view-count.txt`.
3. Visit the site once and confirm the number appears. If it stays as `—`, check the browser console and the file permissions.

Do not edit the bundled `.htaccess`; it belongs to the host. Add your own rules in a separate `.htaccess` if needed.

## Deploying

Upload the contents of this folder to the web root (not the folder itself), keeping `Musics/`, `Images/`, and `Videoes/` intact. `index.html` is the directory index. The site works on any static host; PHP is only needed for the live counter.

Fonts load from Google Fonts (Bricolage Grotesque, Instrument Serif, Space Grotesk, JetBrains Mono, Caveat). Without a connection the system fallbacks take over.

## Notes

- No frameworks, bundlers, or dependencies.
- Scripts are classic deferred files, in this order: `data.js`, `site.js`, `player.js`.
- All four pages score 1.00 for accessibility, best practices, and SEO in Lighthouse.
- The mobile menu traps nothing and restores focus to the toggle when closed with `Escape`; closed content is `inert`.
- Content is rendered by JavaScript, so the library, gallery, and player need JavaScript enabled.
