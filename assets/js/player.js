/* ==========================================================================
   Javier's New Home — the player
   One persistent audio engine for every page. Dock, expanded panel, queue,
   shuffle, repeat, favorites, media session, keyboard shortcuts.
   ========================================================================== */

(function () {
  'use strict';

  var tracks = (window.JH && window.JH.tracks) || [];
  if (!tracks.length) return;

  var JH = window.JH;
  var doc = document;
  var STORE = 'javier.player.v1';
  var FAV_KEY = 'javier.favs.v1';

  var ICONS = {
    play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4.5" height="16" rx="1"/><rect x="13.5" y="4" width="4.5" height="16" rx="1"/></svg>',
    prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5l-11 7 11 7z"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h3.5c1.5 0 2.8.8 3.7 2.1l3.6 5.8c.9 1.3 2.2 2.1 3.7 2.1H21"/><path d="M3 17h3.5c1.5 0 2.8-.8 3.7-2.1l.6-1"/><path d="M13.2 9.1l.6-1C14.7 6.8 16 6 17.5 6H21"/><path d="M18 3l3 3-3 3M18 14l3 3-3 3"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    volume: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/></svg>',
    mute: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l6 6M22 9l-6 6"/></svg>',
    queue: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 6h12M4 12h12M4 18h8"/><path d="M18 15v5M15.5 17.5h5"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
  };

  function readStore() {
    try {
      var raw = localStorage.getItem(STORE);
      return raw ? JSON.parse(raw) : null;
    } catch (err) { return null; }
  }

  function saveStore(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (err) {}
  }

  function findTrack(file) {
    return tracks.find(function (track) { return track.f === file; });
  }

  function srcFor(file) {
    return 'Musics/' + encodeURIComponent(file).replace(/%2F/g, '/');
  }

  function palette(track) {
    return (JH.palettes && JH.palettes[track.c]) || ['#2b46f5', '#f0388c'];
  }

  function timeLabel(seconds) {
    return JH.fmtTime(seconds);
  }

  function safeNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  /* -------------------------------- state ------------------------------- */

  var saved = readStore() || {};
  var state = {
    shuffle: !!saved.shuffle,
    repeat: (saved.repeat === 'all' || saved.repeat === 'one') ? saved.repeat : 'off',
    volume: Math.min(1, Math.max(0, safeNumber(saved.volume, 0.8))),
    muted: !!saved.muted
  };

  var audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = state.volume;
  audio.muted = state.muted;

  var current = findTrack(saved.file) || findTrack('Past Lives.mp3') || tracks[0];
  var pendingSeek = safeNumber(saved.time, 0);
  var history = [];
  var saveTimer = 0;
  var userHasPlayed = false;
  var wasPlaying = !!saved.playing;

  /* ------------------------------- markup ------------------------------- */

  var dock = document.createElement('div');
  dock.className = 'dock';
  dock.id = 'player-dock';
  dock.setAttribute('data-player', '');
  dock.innerHTML =
    '<div class="dock__seek">' +
      '<span class="dock__seek-time" data-cur>0:00</span>' +
      '<input class="range range--seek" data-seek type="range" min="0" max="1000" step="1" value="0" aria-label="Seek through the track">' +
      '<span class="dock__seek-time dock__seek-time--right" data-dur>0:00</span>' +
    '</div>' +
    '<div class="dock__inner">' +
      '<div class="dock__now">' +
        '<button class="dock__cover" type="button" data-open-player aria-label="Open the now playing panel">' +
          '<span class="cover" data-dock-cover><span class="cover__initial" data-dock-initial>P</span></span>' +
        '</button>' +
        '<div class="dock__meta">' +
          '<span class="dock__kicker"><span class="bars"><i></i><i></i><i></i></span> <span data-kicker>READY</span></span>' +
          '<button class="dock__title" type="button" data-open-player data-dock-title>Past Lives</button>' +
          '<span class="dock__artist" data-dock-artist>sapientdream</span>' +
        '</div>' +
      '</div>' +
      '<div class="dock__transport">' +
        '<button class="dock-btn" type="button" data-shuffle-toggle aria-pressed="false" aria-label="Shuffle" title="Shuffle">' + ICONS.shuffle + '</button>' +
        '<button class="dock-btn" type="button" data-prev aria-label="Previous track" title="Previous">' + ICONS.prev + '</button>' +
        '<button class="dock-btn dock-btn--play dock__play" type="button" data-toggle-play aria-label="Play">' +
          '<span class="icon-play">' + ICONS.play + '</span><span class="icon-pause">' + ICONS.pause + '</span>' +
        '</button>' +
        '<button class="dock-btn" type="button" data-next aria-label="Next track" title="Next">' + ICONS.next + '</button>' +
        '<button class="dock-btn" type="button" data-repeat-toggle aria-pressed="false" aria-label="Repeat: off" title="Repeat">' + ICONS.repeat + '<span class="repeat-one">1</span></button>' +
      '</div>' +
      '<div class="dock__right">' +
        '<span class="dock__time"><span data-dock-cur>0:00</span> / <span data-dock-dur>0:00</span></span>' +
        '<div class="dock__vol">' +
          '<button class="dock-btn" type="button" data-mute aria-label="Mute" title="Mute">' + ICONS.volume + '</button>' +
          '<input class="range range--vol" data-volume type="range" min="0" max="1" step="0.01" value="' + state.volume + '" aria-label="Volume">' +
        '</div>' +
        '<button class="dock__open" type="button" data-open-player>' + ICONS.queue + '<span>Queue</span></button>' +
      '</div>' +
    '</div>';
  doc.body.appendChild(dock);

  var dialog = document.createElement('dialog');
  dialog.className = 'np';
  dialog.id = 'now-playing';
  dialog.setAttribute('aria-label', 'Now playing');
  dialog.innerHTML =
    '<div class="np__scroll">' +
      '<div class="np__bar">' +
        '<span class="kicker">Now playing</span>' +
        '<button class="np__close" type="button" data-close-np aria-label="Close the player">' + ICONS.close + ' Close</button>' +
      '</div>' +
      '<div class="np__grid">' +
        '<figure class="np__art">' +
          '<span class="tape" aria-hidden="true"></span>' +
          '<div class="cover" data-np-cover><span class="cover__initial" data-np-initial>P</span><span class="cover__stamp">Javier’s archive</span><span class="cover__side">Side A</span></div>' +
          '<figcaption><span data-np-side>Side A / 64 tracks</span><span>33⅓ rpm</span></figcaption>' +
        '</figure>' +
        '<div class="np__body">' +
          '<span class="kicker" data-np-kicker>NOW PLAYING</span>' +
          '<h2 data-np-title>Past Lives</h2>' +
          '<p class="np__artist" data-np-artist>sapientdream</p>' +
          '<div class="np__seek">' +
            '<input class="range" data-np-seek type="range" min="0" max="1000" step="1" value="0" aria-label="Seek through the track">' +
            '<div class="np__times"><span data-np-cur>0:00</span><span data-np-dur>0:00</span></div>' +
          '</div>' +
          '<div class="np__controls">' +
            '<button class="dock-btn" type="button" data-shuffle-toggle aria-pressed="false" aria-label="Shuffle" title="Shuffle">' + ICONS.shuffle + '</button>' +
            '<button class="dock-btn" type="button" data-prev aria-label="Previous track" title="Previous">' + ICONS.prev + '</button>' +
            '<button class="dock-btn dock-btn--play dock__play" type="button" data-toggle-play aria-label="Play"><span class="icon-play">' + ICONS.play + '</span><span class="icon-pause">' + ICONS.pause + '</span></button>' +
            '<button class="dock-btn" type="button" data-next aria-label="Next track" title="Next">' + ICONS.next + '</button>' +
            '<button class="dock-btn" type="button" data-repeat-toggle aria-pressed="false" aria-label="Repeat: off" title="Repeat">' + ICONS.repeat + '<span class="repeat-one">1</span></button>' +
          '</div>' +
          '<div class="np__actions">' +
            '<button class="np__fav" type="button" data-np-fav aria-pressed="false" aria-label="Save this track">' + ICONS.heart + '<span data-np-fav-label>Save</span></button>' +
            '<span class="np__hint">Space play / pause<br>N next · P previous · M mute</span>' +
          '</div>' +
          '<div class="np__next">' +
            '<div class="np__next-head"><span>Up next</span><span data-np-next-label>Side A</span></div>' +
            '<ol data-np-next></ol>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  doc.body.appendChild(dialog);

  /* ------------------------------ references ---------------------------- */

  var $ = function (selector, root) { return (root || doc).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(selector)); };

  var dockCover = $('[data-dock-cover]', dock);
  var dockTitle = $('[data-dock-title]', dock);
  var dockArtist = $('[data-dock-artist]', dock);
  var dockKicker = $('[data-kicker]', dock);
  var dockCur = $('[data-dock-cur]', dock);
  var dockDur = $('[data-dock-dur]', dock);
  var npCover = $('[data-np-cover]', dialog);
  var npTitle = $('[data-np-title]', dialog);
  var npArtist = $('[data-np-artist]', dialog);
  var npKicker = $('[data-np-kicker]', dialog);
  var npSide = $('[data-np-side]', dialog);
  var npFav = $('[data-np-fav]', dialog);
  var npFavLabel = $('[data-np-fav-label]', dialog);
  var npNext = $('[data-np-next]', dialog);
  var npNextLabel = $('[data-np-next-label]', dialog);

  function setText(selector, value, root) {
    $$(selector, root).forEach(function (el) { el.textContent = value; });
  }

  function paintCover(el, track) {
    if (!el || !track) return;
    var pal = palette(track);
    el.style.setProperty('--ca', pal[0]);
    el.style.setProperty('--cb', pal[1]);
    var initialEl = el.querySelector('.cover__initial');
    if (initialEl) initialEl.textContent = JH.initial(track.t);
  }

  /* ------------------------------ rendering ----------------------------- */

  function syncRows() {
    $$('[data-play]').forEach(function (el) {
      var on = current && el.getAttribute('data-play') === current.f;
      var row = el.closest('.track, .staff-item');
      if (row) {
        row.classList.toggle('is-current', !!on);
        if (on) row.setAttribute('data-current', 'true');
        else row.removeAttribute('data-current');
      }
    });
    syncFavorite();
  }

  function renderTrack() {
    if (!current) return;
    paintCover(dockCover, current);
    paintCover(npCover, current);

    if (dockTitle) dockTitle.textContent = current.t;
    if (dockArtist) dockArtist.textContent = current.a;
    if (npTitle) npTitle.textContent = current.t;
    if (npArtist) npArtist.textContent = current.a;
    if (npSide) npSide.textContent = 'Side A / ' + tracks.length + ' tracks';
    setText('[data-player-title]', current.t);
    setText('[data-player-artist]', current.a);
    setText('[data-nav-track]', current.t);
    setText('[data-player-initial]', JH.initial(current.t));
    setText('[data-cassette-number]', 'No. ' + String(tracks.indexOf(current) + 1).padStart(2, '0') + ' / ' + tracks.length);

    renderNext();
    syncRows();
    updateMediaSession();
  }

  function renderPlayState() {
    var playing = !audio.paused && !audio.ended;
    doc.body.classList.toggle('is-playing', playing);

    $$('[data-toggle-play]').forEach(function (btn) {
      btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      btn.setAttribute('title', playing ? 'Pause' : 'Play');
    });

    var kicker = playing ? 'NOW PLAYING' : (audio.currentTime > 0.5 ? 'PAUSED' : 'READY');
    if (dockKicker) dockKicker.textContent = kicker;
    if (npKicker) npKicker.textContent = kicker === 'NOW PLAYING' ? 'NOW PLAYING' : (kicker === 'PAUSED' ? 'PAUSED' : 'READY WHEN YOU ARE');

    $$('[data-cassette-label]').forEach(function (el) { el.textContent = playing ? 'PAUSE' : 'PLAY'; });
    $$('[data-cassette-icon]').forEach(function (el) { el.innerHTML = playing ? ICONS.pause : ICONS.play; });

    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (err) {}
    }
  }

  function renderTime() {
    var duration = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : (current ? current.d : 0);
    var position = isFinite(audio.currentTime) ? audio.currentTime : 0;
    var pct = duration ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

    $$('[data-seek], [data-np-seek]').forEach(function (input) {
      input.value = String(Math.round(pct * 10));
      input.style.setProperty('--p', pct + '%');
      input.setAttribute('aria-valuetext', timeLabel(position) + ' of ' + timeLabel(duration));
    });

    setText('[data-cur], [data-np-cur]', timeLabel(position));
    setText('[data-dur], [data-np-dur], [data-dock-dur]', timeLabel(duration));
    if (dockCur) dockCur.textContent = timeLabel(position);
    if (dockDur) dockDur.textContent = timeLabel(duration);

    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: audio.playbackRate,
          position: Math.min(position, duration)
        });
      } catch (err) {}
    }
  }

  function renderNext() {
    if (!npNext || !current) return;
    var list = [];
    if (state.shuffle && tracks.length > 1) {
      var pool = tracks.filter(function (track) { return track.f !== current.f; });
      for (var i = 0; i < 5 && pool.length; i++) {
        var pick = Math.floor(Math.random() * pool.length);
        list.push(pool.splice(pick, 1)[0]);
      }
    } else {
      var index = tracks.indexOf(current);
      for (var j = 1; j <= Math.min(5, tracks.length - 1); j++) {
        list.push(tracks[(index + j + tracks.length) % tracks.length]);
      }
    }

    npNext.innerHTML = list.map(function (track, position) {
      var pal = palette(track);
      return '<li><button class="np-next-item" type="button" data-play="' + JH.esc(track.f) + '">' +
        '<span class="np-next-item__i">' + String(position + 1).padStart(2, '0') + '</span>' +
        '<span class="track__art" style="--ca:' + pal[0] + ';--cb:' + pal[1] + '" aria-hidden="true"><span>' + JH.esc(JH.initial(track.t)) + '</span></span>' +
        '<span class="np-next-item__t"><b>' + JH.esc(track.t) + '</b><span>' + JH.esc(track.a) + '</span></span>' +
        '<span class="np-next-item__d">' + timeLabel(track.d) + '</span>' +
      '</button></li>';
    }).join('');

    if (npNextLabel) npNextLabel.textContent = state.shuffle ? 'Shuffled' : 'Side A';
  }

  function syncFavorite() {
    if (!npFav || !current) return;
    var on = JH.favorites ? JH.favorites.has(current.f) : false;
    npFav.classList.toggle('is-on', on);
    npFav.setAttribute('aria-pressed', on ? 'true' : 'false');
    npFav.setAttribute('aria-label', on ? 'Remove this track from favorites' : 'Save this track to favorites');
    if (npFavLabel) npFavLabel.textContent = on ? 'Saved' : 'Save';
  }

  /* ------------------------------- controls ----------------------------- */

  function updateShuffle() {
    $$('[data-shuffle-toggle]').forEach(function (btn) {
      btn.classList.toggle('is-on', state.shuffle);
      btn.setAttribute('aria-pressed', state.shuffle ? 'true' : 'false');
      btn.setAttribute('aria-label', state.shuffle ? 'Shuffle: on' : 'Shuffle: off');
      btn.title = state.shuffle ? 'Shuffle: on' : 'Shuffle: off';
    });
  }

  function updateRepeat() {
    $$('[data-repeat-toggle]').forEach(function (btn) {
      btn.classList.toggle('is-on', state.repeat !== 'off');
      btn.classList.toggle('is-one', state.repeat === 'one');
      btn.setAttribute('aria-pressed', state.repeat !== 'off' ? 'true' : 'false');
      btn.setAttribute('aria-label', 'Repeat: ' + state.repeat);
      btn.title = 'Repeat: ' + state.repeat;
    });
  }

  function updateMute() {
    var silent = state.muted || state.volume === 0;
    $$('[data-mute]').forEach(function (btn) {
      btn.innerHTML = silent ? ICONS.mute : ICONS.volume;
      btn.setAttribute('aria-label', silent ? 'Unmute' : 'Mute');
      btn.title = silent ? 'Unmute' : 'Mute';
      btn.classList.toggle('is-on', silent);
    });
    $$('[data-volume]').forEach(function (input) {
      input.value = String(state.volume);
      input.style.setProperty('--p', (state.volume * 100) + '%');
    });
  }

  function togglePlay() {
    if (!current) return;
    if (!audio.src) {
      selectFile(current.f, { play: true, seek: pendingSeek });
      return;
    }
    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      playAudio(false);
    } else {
      audio.pause();
    }
  }

  function playAudio(silent) {
    var attempt;
    try { attempt = audio.play(); } catch (err) { attempt = null; }
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        renderPlayState();
        if (!silent) JH.toast('Press play once — your browser needs a tap.');
      });
    }
  }

  function selectFile(file, options) {
    options = options || {};
    var track = findTrack(file);
    if (!track) return;
    current = track;
    pendingSeek = options.seek || 0;
    audio.src = srcFor(track.f);
    audio.loop = state.repeat === 'one';
    audio.load();
    renderTrack();
    renderTime();
    renderPlayState();
    if (options.play !== false) playAudio(!!options.silent);
    saveNow();
  }

  function pickRandom() {
    if (tracks.length <= 1) return tracks[0];
    var pool = tracks.filter(function (track) { return track.f !== current.f; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function next(auto) {
    if (!current) return;
    var index = tracks.indexOf(current);
    var upcoming;

    if (state.shuffle) {
      upcoming = pickRandom();
    } else {
      if (index === tracks.length - 1) {
        if (auto && state.repeat === 'off') {
          renderPlayState();
          saveNow();
          return;
        }
        upcoming = tracks[0];
      } else {
        upcoming = tracks[index + 1];
      }
    }

    if (!upcoming) return;
    if (current) history.push(current.f);
    if (history.length > 60) history.shift();
    selectFile(upcoming.f, { play: true });
  }

  function previous() {
    if (!current) return;
    if (audio.currentTime > 4) {
      audio.currentTime = 0;
      renderTime();
      return;
    }

    var target;
    if (state.shuffle && history.length) {
      target = findTrack(history.pop());
    } else {
      var index = tracks.indexOf(current);
      target = tracks[(index - 1 + tracks.length) % tracks.length];
      history.push(current.f);
    }
    if (target) selectFile(target.f, { play: true });
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    updateShuffle();
    renderNext();
    saveNow();
    JH.toast(state.shuffle ? 'Shuffle on' : 'Shuffle off');
  }

  function toggleRepeat() {
    state.repeat = state.repeat === 'off' ? 'all' : (state.repeat === 'all' ? 'one' : 'off');
    audio.loop = state.repeat === 'one';
    updateRepeat();
    saveNow();
    JH.toast('Repeat: ' + state.repeat);
  }

  function toggleMute() {
    state.muted = !state.muted;
    audio.muted = state.muted;
    updateMute();
    saveNow();
  }

  function seekBy(seconds) {
    var duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (current ? current.d : 0);
    if (!duration) return;
    audio.currentTime = Math.min(duration, Math.max(0, audio.currentTime + seconds));
    renderTime();
  }

  /* ------------------------------- storage ------------------------------ */

  function saveNow() {
    saveStore({
      file: current ? current.f : null,
      time: isFinite(audio.currentTime) ? audio.currentTime : 0,
      playing: !audio.paused && !audio.ended,
      shuffle: state.shuffle,
      repeat: state.repeat,
      volume: state.volume,
      muted: state.muted
    });
  }

  function saveThrottled() {
    var now = Date.now();
    if (now - saveTimer > 1600) {
      saveTimer = now;
      saveNow();
    }
  }

  /* ----------------------------- media session -------------------------- */

  function coverDataUrl(track) {
    var pal = palette(track);
    var initial = JH.initial(track.t).replace(/[<>&"']/g, '');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="512" height="512" fill="url(#g)"/>' +
      '<circle cx="256" cy="256" r="136" fill="#f7f1e4"/>' +
      '<text x="256" y="320" font-family="Arial Black, Arial, sans-serif" font-size="150" font-weight="800" text-anchor="middle" fill="#18150f">' + initial + '</text>' +
      '<text x="256" y="390" font-family="Arial, sans-serif" font-size="17" letter-spacing="5" text-anchor="middle" fill="#18150f" opacity=".55">JAVIER’S ARCHIVE</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !current) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.t,
        artist: current.a,
        album: 'Javier’s New Home',
        artwork: [{ src: coverDataUrl(current), sizes: '512x512', type: 'image/svg+xml' }]
      });
      navigator.mediaSession.setActionHandler('play', function () { togglePlay(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { previous(); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { next(false); });
      if (navigator.mediaSession.setActionHandler) {
        navigator.mediaSession.setActionHandler('seekto', function (details) {
          if (details && details.seekTime != null) {
            audio.currentTime = details.seekTime;
            renderTime();
          }
        });
      }
    } catch (err) {}
  }

  /* -------------------------------- audio ------------------------------- */

  audio.addEventListener('loadedmetadata', function () {
    var duration = isFinite(audio.duration) ? audio.duration : 0;
    if (pendingSeek > 0 && duration) {
      audio.currentTime = Math.min(pendingSeek, Math.max(0, duration - 0.5));
    }
    pendingSeek = 0;
    renderTime();
  });

  audio.addEventListener('durationchange', renderTime);
  audio.addEventListener('timeupdate', function () {
    renderTime();
    saveThrottled();
  });
  audio.addEventListener('play', function () {
    userHasPlayed = true;
    renderPlayState();
    saveNow();
  });
  audio.addEventListener('pause', function () {
    renderPlayState();
    saveNow();
  });
  audio.addEventListener('ended', function () {
    if (state.repeat === 'one') {
      audio.currentTime = 0;
      playAudio(true);
      return;
    }
    if (state.repeat === 'off' && !state.shuffle && tracks.indexOf(current) === tracks.length - 1) {
      renderPlayState();
      saveNow();
      return;
    }
    next(true);
  });
  audio.addEventListener('error', function () {
    renderPlayState();
    JH.toast('That track could not be loaded. Check the file in /Musics.');
  });
  audio.addEventListener('volumechange', function () {
    if (audio.muted !== state.muted && state.volume > 0) {
      state.muted = audio.muted;
      updateMute();
    }
  });

  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) saveNow();
  });

  /* ------------------------------ interactions -------------------------- */

  $$('[data-toggle-play]').forEach(function (button) {
    button.addEventListener('click', togglePlay);
  });
  $$('[data-prev]').forEach(function (button) {
    button.addEventListener('click', previous);
  });
  $$('[data-next]').forEach(function (button) {
    button.addEventListener('click', function () { next(false); });
  });
  $$('[data-shuffle-toggle]').forEach(function (button) {
    button.addEventListener('click', toggleShuffle);
  });
  $$('[data-repeat-toggle]').forEach(function (button) {
    button.addEventListener('click', toggleRepeat);
  });
  $$('[data-mute]').forEach(function (button) {
    button.addEventListener('click', toggleMute);
  });

  $$('[data-open-player]').forEach(function (button) {
    button.addEventListener('click', openPlayer);
  });
  $$('[data-close-np]').forEach(function (button) {
    button.addEventListener('click', closePlayer);
  });
  if (npFav) {
    npFav.addEventListener('click', function () {
      if (!current) return;
      var on = JH.favorites.toggle(current.f);
      syncFavorite();
      JH.toast(on ? 'Saved to favorites' : 'Removed from favorites');
    });
  }
  document.addEventListener('jh:favs', syncFavorite);

  $$('[data-seek], [data-np-seek]').forEach(function (input) {
    input.addEventListener('input', function () {
      var duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (current ? current.d : 0);
      if (!duration) return;
      audio.currentTime = Math.min(duration, Math.max(0, (Number(input.value) / 1000) * duration));
      renderTime();
    });
    input.addEventListener('change', saveNow);
  });

  $$('[data-volume]').forEach(function (input) {
    input.addEventListener('input', function () {
      state.volume = Math.min(1, Math.max(0, Number(input.value)));
      state.muted = state.volume === 0;
      audio.volume = state.volume;
      audio.muted = state.muted;
      updateMute();
    });
    input.addEventListener('change', saveNow);
  });

  document.addEventListener('click', function (event) {
    var playTarget = event.target.closest ? event.target.closest('[data-play]') : null;
    if (playTarget) {
      event.preventDefault();
      var file = playTarget.getAttribute('data-play');
      if (!findTrack(file)) return;
      if (current && file === current.f) togglePlay();
      else {
        if (current) history.push(current.f);
        selectFile(file, { play: true });
      }
      return;
    }

    var shuffleTarget = event.target.closest ? event.target.closest('[data-shuffle]') : null;
    if (shuffleTarget) {
      event.preventDefault();
      state.shuffle = true;
      updateShuffle();
      var random = pickRandom();
      if (random) {
        if (current) history.push(current.f);
        selectFile(random.f, { play: true });
        JH.toast('Shuffling the archive');
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;

    if (event.code === 'Space') {
      if (event.target.closest && event.target.closest('button, a, [role="button"]')) return;
      event.preventDefault();
      togglePlay();
      return;
    }
    if (event.key === 'n' || event.key === 'N') { event.preventDefault(); next(false); }
    if (event.key === 'p' || event.key === 'P') { event.preventDefault(); previous(); }
    if (event.key === 'm' || event.key === 'M') { toggleMute(); }
    if (event.key === 's' || event.key === 'S') { toggleShuffle(); }
  });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closePlayer();
  });
  dialog.addEventListener('close', function () {
    document.body.classList.remove('no-scroll');
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'INPUT') return;
    if (event.key === 'ArrowRight') { event.preventDefault(); seekBy(5); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); seekBy(-5); }
  });

  document.addEventListener('jh:rendered', syncRows);

  function openPlayer() {
    renderTrack();
    renderPlayState();
    renderTime();
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('no-scroll');
    var close = dialog.querySelector('[data-close-np]');
    if (close) close.focus();
  }

  function closePlayer() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('no-scroll');
  }

  /* --------------------------------- boot ------------------------------- */

  updateShuffle();
  updateRepeat();
  updateMute();
  renderTrack();
  renderPlayState();
  renderTime();

  audio.src = srcFor(current.f);
  audio.loop = state.repeat === 'one';
  audio.load();

  if (wasPlaying) {
    playAudio(true);
  }

  saveNow();
})();

