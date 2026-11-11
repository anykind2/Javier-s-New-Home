/* ==========================================================================
   Javier's New Home — site interactions
   Theme, navigation, reveals, counter, daily truths, music library, gallery.
   Plain ES5-ish JavaScript. No build step, no dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var JH = window.JH = window.JH || {};
  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THEME_KEY = 'javier.theme';
  var FAV_KEY = 'javier.favs.v1';
  var RULES_KEY = 'javier.rules.v1';

  /* ------------------------------ helpers ------------------------------- */

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
  }

  function fmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function initial(title) {
    var match = String(title || '?').match(/[A-Za-z0-9\u00C0-\uFFFF\u3040-\u30FF\u4E00-\u9FFF]/);
    return match ? match[0].toUpperCase() : '?';
  }

  function dayOfYear(date) {
    var d = date || new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function dateKey(date) {
    var d = date || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function toast(message) {
    var host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    host.appendChild(item);
    window.setTimeout(function () {
      item.classList.add('is-out');
      window.setTimeout(function () { item.remove(); }, 260);
    }, 2600);
  }

  JH.fmtTime = fmtTime;
  JH.esc = esc;
  JH.initial = initial;
  JH.toast = toast;

  /* ------------------------------- theme -------------------------------- */

  var themeToggle = document.querySelector('[data-theme-toggle]');

  function setTheme(theme, persist) {
    doc.dataset.theme = theme;
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (err) {} }
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('title', theme === 'dark' ? 'Lights on' : 'Lights off');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f0f16' : '#f2ecdf');
  }

  if (!doc.dataset.theme) {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light', false);
  } else {
    setTheme(doc.dataset.theme, false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(doc.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------------------------- navigation ------------------------------ */

  var nav = document.querySelector('[data-nav]');
  var libraryBar = document.querySelector('[data-library-bar]');
  var menu = document.getElementById('mobile-menu');
  var menuToggle = document.querySelector('[data-menu-toggle]');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 6);
    if (libraryBar) {
      var top = libraryBar.getBoundingClientRect().top;
      libraryBar.classList.toggle('is-stuck', top <= (nav ? nav.offsetHeight + 1 : 70));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.inert = !open;
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      window.setTimeout(function () {
        var first = menu.querySelector('a');
        if (first) first.focus();
      }, 260);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
  }
  if (menu) {
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      if (menuToggle) menuToggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820 && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ----------------------------- reveals -------------------------------- */

  (function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ----------------------------- visitor count -------------------------- */

  (function initCounter() {
    var nodes = document.querySelectorAll('[data-view-count]');
    if (!nodes.length) return;

    if (location.protocol === 'file:') {
      nodes.forEach(function (node) { node.textContent = '—'; });
      nodes.forEach(function (node) { node.setAttribute('title', 'Live count appears when this site is opened from its PHP host.'); });
      return;
    }

    fetch('view-counter.php', { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('counter offline');
        return res.json();
      })
      .then(function (data) {
        var target = parseInt(data && data.count, 10);
        if (!isFinite(target) || target < 0) throw new Error('bad count');
        nodes.forEach(function (node) {
          node.textContent = target.toLocaleString();
          node.classList.add('is-live');
        });
        var stamp = document.querySelector('[data-view-card]');
        if (stamp) stamp.classList.add('is-live');
      })
      .catch(function () {
        nodes.forEach(function (node) {
          node.textContent = '—';
          node.setAttribute('title', 'The live counter needs the PHP host. It will catch up online.');
        });
      });
  })();

  /* ----------------------------- staff picks ---------------------------- */

  (function initStaffPicks() {
    var host = document.querySelector('[data-staff-picks]');
    if (!host || !JH.tracks) return;
    var tracks = JH.tracks;
    var picks = (JH.staffPicks || []).map(function (file) {
      return tracks.find(function (track) { return track.f === file; });
    }).filter(Boolean).slice(0, 5);

    host.innerHTML = picks.map(function (track, index) {
      return '<button class="staff-item" type="button" data-play="' + esc(track.f) + '" aria-label="Play ' + esc(track.t) + ' by ' + esc(track.a) + '">' +
        '<span class="staff-item__num">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<span class="staff-item__title"><b>' + esc(track.t) + '</b><span>' + esc(track.a) + '</span></span>' +
        '<span class="staff-item__time">' + fmtTime(track.d) + '</span>' +
        '<span class="staff-item__play" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg></span>' +
        '</button>';
    }).join('');
  })();

  (function initLibraryStats() {
    var count = (JH.tracks || []).length;
    var total = JH.librarySeconds || 0;
    var hours = Math.floor(total / 3600);
    var minutes = Math.round((total % 3600) / 60);
    var label = (hours ? hours + 'h ' : '') + minutes + 'm';

    document.querySelectorAll('[data-library-count]').forEach(function (node) { node.textContent = count; });
    document.querySelectorAll('[data-library-time]').forEach(function (node) { node.textContent = label; });
    document.querySelectorAll('[data-library-time-long]').forEach(function (node) { node.textContent = hours + ' hours ' + minutes + ' minutes'; });
    document.querySelectorAll('[data-total-count]').forEach(function (node) { node.textContent = count + ' tracks'; });
    document.querySelectorAll('[data-year]').forEach(function (node) { node.textContent = new Date().getFullYear(); });
  })();

  /* --------------------------- quote rotations -------------------------- */

  var truths = JH.truths || [];
  var truthCursor = truths.length ? dayOfYear() % truths.length : 0;

  function renderTruth(animate) {
    if (!truths.length) return;
    var truth = truths[truthCursor % truths.length];
    var quoteNodes = document.querySelectorAll('[data-daily-quote], [data-home-quote]');
    var keyNodes = document.querySelectorAll('[data-daily-key], [data-home-truth-key]');
    var countNodes = document.querySelectorAll('[data-truth-index]');
    var label = String((truthCursor % truths.length) + 1).padStart(2, '0') + ' / ' + String(truths.length).padStart(2, '0');

    function apply() {
      quoteNodes.forEach(function (node) {
        node.textContent = truth.q;
        node.classList.remove('is-changing');
      });
      keyNodes.forEach(function (node) { node.textContent = truth.k; });
      countNodes.forEach(function (node) { node.textContent = label; });
    }

    if (animate && !reduceMotion) {
      quoteNodes.forEach(function (node) { node.classList.add('is-changing'); });
      window.setTimeout(apply, 170);
    } else {
      apply();
    }
  }

  var nextTruth = document.querySelector('[data-next-truth]');
  if (nextTruth) {
    nextTruth.addEventListener('click', function () {
      truthCursor = (truthCursor + 1) % truths.length;
      renderTruth(true);
    });
  }
  renderTruth(false);

  /* ------------------------------- today -------------------------------- */

  (function initToday() {
    var now = new Date();
    var dayNodes = document.querySelectorAll('[data-today-day]');
    var monthNodes = document.querySelectorAll('[data-today-month]');
    var weekdayNodes = document.querySelectorAll('[data-today-weekday]');
    var yearNodes = document.querySelectorAll('[data-today-year]');
    var dayNumNodes = document.querySelectorAll('[data-day-of-year]');

    dayNodes.forEach(function (node) { node.textContent = String(now.getDate()).padStart(2, '0'); });
    monthNodes.forEach(function (node) {
      node.textContent = now.toLocaleDateString('en-US', { month: 'long' });
    });
    weekdayNodes.forEach(function (node) {
      node.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    });
    yearNodes.forEach(function (node) { node.textContent = now.getFullYear(); });
    dayNumNodes.forEach(function (node) { node.textContent = String(dayOfYear(now)).padStart(3, '0'); });
  })();

  /* --------------------------- the daily rules -------------------------- */

  (function initRules() {
    var rules = Array.prototype.slice.call(document.querySelectorAll('[data-rule]'));
    if (!rules.length) return;

    var save = readJSON(RULES_KEY, {});
    var today = dateKey();
    var done = (save && save.date === today && Array.isArray(save.done)) ? save.done : [];
    var doneSet = new Set(done);
    var bar = document.querySelector('[data-progress-bar]');
    var progress = document.querySelector('[data-progress]');
    var text = document.querySelector('[data-progress-text]');
    var reset = document.querySelector('[data-reset-rules]');

    function update(celebrate) {
      var total = rules.length;
      var count = 0;
      rules.forEach(function (row) {
        var id = row.getAttribute('data-rule');
        var isDone = doneSet.has(id);
        row.classList.toggle('is-done', isDone);
        row.setAttribute('aria-pressed', isDone ? 'true' : 'false');
        if (isDone) count++;
      });
      var pct = total ? Math.round((count / total) * 100) : 0;
      if (bar) bar.style.width = pct + '%';
      if (progress) {
        progress.setAttribute('aria-valuenow', String(count));
        progress.setAttribute('aria-valuetext', count + ' of ' + total + ' rules done today');
      }
      if (text) text.textContent = count + ' / ' + total + ' done today';
      if (celebrate && count === total) toast('All 19 done. Now go live it.');
    }

    function persist() {
      writeJSON(RULES_KEY, { date: today, done: Array.from(doneSet) });
    }

    rules.forEach(function (row) {
      row.addEventListener('click', function () {
        var id = row.getAttribute('data-rule');
        if (doneSet.has(id)) doneSet.delete(id);
        else doneSet.add(id);
        persist();
        update(true);
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        doneSet.clear();
        persist();
        update(false);
        toast('Fresh page. Start again.');
      });
    }

    update(false);
  })();

  /* ------------------------- local video + youtube ----------------------- */

  (function initVideo() {
    document.querySelectorAll('[data-video-start]').forEach(function (cover) {
      var shell = cover.closest('.video-shell');
      var video = shell ? shell.querySelector('video') : null;
      if (!video) return;
      cover.addEventListener('click', function () {
        cover.classList.add('is-hidden');
        var play = video.play();
        if (play && play.catch) play.catch(function () { cover.classList.remove('is-hidden'); });
      });
      video.addEventListener('ended', function () { cover.classList.remove('is-hidden'); });
    });
  })();

  (function initYouTube() {
    document.querySelectorAll('[data-yt]').forEach(function (box) {
      var button = box.querySelector('[data-yt-start]');
      if (!button) return;
      button.addEventListener('click', function () {
        var id = box.getAttribute('data-yt');
        if (!id) return;
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
        frame.title = box.getAttribute('data-yt-title') || 'YouTube video';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;
        box.innerHTML = '';
        box.appendChild(frame);
      });
    });
  })();

  /* ------------------------------ favorites ----------------------------- */

  var favSet = new Set(readJSON(FAV_KEY, []));

  function saveFavorites() {
    writeJSON(FAV_KEY, Array.from(favSet));
    document.dispatchEvent(new CustomEvent('jh:favs', { detail: { favorites: Array.from(favSet) } }));
  }

  JH.favorites = {
    all: function () { return Array.from(favSet); },
    has: function (file) { return favSet.has(file); },
    toggle: function (file) {
      if (favSet.has(file)) favSet.delete(file);
      else favSet.add(file);
      saveFavorites();
      return favSet.has(file);
    }
  };

  /* --------------------------- music library ---------------------------- */

  var ICON_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
  var ICON_HEART = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';

  (function initLibrary() {
    var list = document.querySelector('[data-tracklist]');
    if (!list || !JH.tracks) return;
    var tracks = JH.tracks;
    var search = document.querySelector('[data-search]');
    var sort = document.querySelector('[data-sort]');
    var empty = document.querySelector('[data-empty]');
    var result = document.querySelector('[data-result]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var resetButtons = document.querySelectorAll('[data-reset-filters]');
    var state = { query: '', filter: 'all', sort: 'az' };

    function render() {
      var query = state.query.trim().toLowerCase();
      var filtered = tracks.filter(function (track) {
        var haystack = (track.t + ' ' + track.a).toLowerCase();
        if (query && haystack.indexOf(query) === -1) return false;
        if (state.filter === 'favs' && !favSet.has(track.f)) return false;
        if (state.filter === 'quick' && track.d >= 180) return false;
        return true;
      });

      var sorted = filtered.slice().sort(function (a, b) {
        if (state.sort === 'za') return b.t.localeCompare(a.t);
        if (state.sort === 'short') return a.d - b.d;
        if (state.sort === 'long') return b.d - a.d;
        return a.t.localeCompare(b.t);
      });

      list.innerHTML = sorted.map(function (track) {
        var palette = (JH.palettes && JH.palettes[track.c]) || ['#2b46f5', '#f0388c'];
        var fav = favSet.has(track.f);
        var number = tracks.indexOf(track) + 1;
        return '<li class="track" data-file="' + esc(track.f) + '">' +
          '<button class="track__hit" type="button" data-play="' + esc(track.f) + '">' +
            '<span class="sr-only">Play </span>' +
            '<span class="track__num">' + String(number).padStart(2, '0') + '</span>' +
            '<span class="track__art" style="--ca:' + palette[0] + ';--cb:' + palette[1] + '" aria-hidden="true"><span>' + esc(initial(track.t)) + '</span></span>' +
            '<span class="track__info"><strong>' + esc(track.t) + '</strong><small>' + esc(track.a) + '</small></span>' +
            '<span class="track__mid"><span class="track__time">' + fmtTime(track.d) + '</span><span class="track__eq" aria-hidden="true"><i></i><i></i><i></i></span></span>' +
            '<span class="track__play" aria-hidden="true">' + ICON_PLAY + '</span>' +
          '</button>' +
          '<button class="track__fav' + (fav ? ' is-on' : '') + '" type="button" data-fav="' + esc(track.f) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remove ' : 'Add ') + esc(track.t) + (fav ? ' from' : ' to') + ' favorites">' + ICON_HEART + '</button>' +
        '</li>';
      }).join('');

      list.hidden = sorted.length === 0;
      if (empty) empty.classList.toggle('is-on', sorted.length === 0);
      if (result) result.innerHTML = 'Showing <b>' + sorted.length + '</b> of ' + tracks.length + ' tracks';

      chips.forEach(function (chip) {
        var count = chip.querySelector('b');
        var value = chip.getAttribute('data-filter');
        if (!count) return;
        if (value === 'all') count.textContent = String(tracks.length);
        if (value === 'favs') count.textContent = String(favSet.size);
        if (value === 'quick') count.textContent = String(tracks.filter(function (t) { return t.d < 180; }).length);
        chip.classList.toggle('is-active', value === state.filter);
      });

      document.dispatchEvent(new CustomEvent('jh:rendered'));
    }

    function setFilter(value) {
      state.filter = value;
      render();
    }

    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value;
        render();
      });
      search.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          search.value = '';
          state.query = '';
          render();
          search.blur();
        }
      });
    }
    if (sort) {
      sort.addEventListener('change', function () {
        state.sort = sort.value;
        render();
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { setFilter(chip.getAttribute('data-filter')); });
    });
    resetButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.query = '';
        state.filter = 'all';
        state.sort = 'az';
        if (search) search.value = '';
        if (sort) sort.value = 'az';
        render();
        if (search) search.focus();
      });
    });

    list.addEventListener('click', function (event) {
      var fav = event.target.closest('[data-fav]');
      if (!fav) return;
      event.preventDefault();
      event.stopPropagation();
      var file = fav.getAttribute('data-fav');
      var nowFav = JH.favorites.toggle(file);
      if (nowFav) toast('Saved to favorites');
      else toast('Removed from favorites');
    });

    document.addEventListener('jh:favs', function () {
      Array.prototype.forEach.call(list.querySelectorAll('[data-fav]'), function (button) {
        var on = favSet.has(button.getAttribute('data-fav'));
        button.classList.toggle('is-on', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (state.filter === 'favs') render();
      else {
        chips.forEach(function (chip) {
          if (chip.getAttribute('data-filter') === 'favs') {
            var badge = chip.querySelector('b');
            if (badge) badge.textContent = String(favSet.size);
          }
        });
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;
      if (search) {
        event.preventDefault();
        search.focus();
        search.select();
      }
    });

    render();
  })();

  /* ------------------------------- gallery ------------------------------ */

  (function initGallery() {
    var pins = Array.prototype.slice.call(document.querySelectorAll('.pin'));
    if (!pins.length) return;

    var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-filter]'));
    var countNode = document.querySelector('[data-gallery-count]');
    var dialog = document.getElementById('lightbox');
    var media = dialog ? dialog.querySelector('[data-lb-media]') : null;
    var titleNode = dialog ? dialog.querySelector('[data-lb-title]') : null;
    var captionNode = dialog ? dialog.querySelector('[data-lb-caption]') : null;
    var countLabel = dialog ? dialog.querySelector('[data-lb-count]') : null;
    var items = [];
    var index = 0;

    function visibleButtons() {
      return Array.prototype.slice.call(document.querySelectorAll('.pin__btn')).filter(function (button) {
        return !button.closest('.pin').hidden;
      });
    }

    function paint(item) {
      if (!item) return;
      if (media) {
        media.innerHTML = '';
        if (item.kind === 'video') {
          var video = document.createElement('video');
          video.src = item.src;
          video.controls = true;
          video.autoplay = true;
          video.playsInline = true;
          media.appendChild(video);
        } else {
          var img = document.createElement('img');
          img.src = item.src;
          img.alt = item.alt || '';
          media.appendChild(img);
        }
      }
      if (titleNode) titleNode.textContent = item.title || '';
      if (captionNode) captionNode.textContent = item.caption || '';
      if (countLabel) countLabel.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    }

    function open(button) {
      if (!dialog) return;
      items = visibleButtons().map(function (btn) {
        return {
          src: btn.getAttribute('data-src'),
          title: btn.getAttribute('data-title'),
          caption: btn.getAttribute('data-caption'),
          kind: btn.getAttribute('data-kind') || 'image',
          alt: btn.getAttribute('data-alt') || btn.getAttribute('data-title') || ''
        };
      });
      index = items.findIndex(function (item) { return item.src === button.getAttribute('data-src'); });
      if (index < 0) index = 0;
      paint(items[index]);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.classList.add('no-scroll');
      var close = dialog.querySelector('[data-lb-close]');
      if (close) close.focus();
    }

    function close() {
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('no-scroll');
      if (media) media.innerHTML = '';
    }

    function step(delta) {
      if (!items.length) return;
      index = (index + delta + items.length) % items.length;
      paint(items[index]);
    }

    pins.forEach(function (pin) {
      var button = pin.querySelector('.pin__btn');
      if (!button) return;
      button.addEventListener('click', function () { open(button); });
    });

    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-gallery-filter');
        filterChips.forEach(function (other) {
          other.classList.toggle('is-active', other === chip);
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        pins.forEach(function (pin) {
          pin.hidden = value !== 'all' && pin.getAttribute('data-cat') !== value;
        });
        if (countNode) {
          var shown = pins.filter(function (pin) { return !pin.hidden; }).length;
          countNode.textContent = shown + ' pieces';
        }
      });
    });

    if (dialog) {
      dialog.querySelector('[data-lb-close]').addEventListener('click', close);
      dialog.querySelector('[data-lb-prev]').addEventListener('click', function () { step(-1); });
      dialog.querySelector('[data-lb-next]').addEventListener('click', function () { step(1); });
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) close();
      });
      dialog.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('no-scroll');
        if (media) media.innerHTML = '';
      });
    }

    if (countNode) countNode.textContent = pins.length + ' pieces';
  })();

  /* -------------------------------- boot -------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('is-ready');
  });
})();
