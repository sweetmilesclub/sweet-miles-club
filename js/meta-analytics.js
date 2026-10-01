// Sweet Miles Club — Meta Pixel, samo uz MARKETING privolu.
//
// Pravila:
// - Prije marketing privole stranica NE učitava Metin kod (connect.facebook.net),
//   ne šalje ništa na facebook.com i ne postavlja _fbp / _fbc. Događaj nastao
//   prije privole se gubi — nikad se ne šalje naknadno.
// - Nakon privole: fbq stub → autoConfig isključen (bez automatskih događaja
//   i skupljanja teksta gumba/obrazaca) → init bez korisničkih podataka
//   (bez advanced matchinga) → PageView.
// - Eventi u ovoj fazi: samo PageView i Lead. Lead šalje obrazac Osobnog
//   reseta tek nakon MailerLite success:true, bez ikakvih parametara.
// - Povlačenje privole: fbq('consent', 'revoke') odmah zaustavlja slanje,
//   brišu se _fbp i _fbc. Kolačiće koje Meta drži na svojoj domeni
//   (facebook.com) stranica ne može brisati.
// - Analytics (GA4) i marketing (Meta) potpuno su odvojeni.
//
// Povezano s CMP-om preko js/consent.js (onConsent / onChange → sync()).

(function () {
  'use strict';

  var PIXEL_ID = '2863165770733134';
  var SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';

  var initialised = false;
  var scriptAdded = false;
  var active = false; // true samo dok marketing privola vrijedi

  function hasConsent() {
    return !!(window.CookieConsent &&
      typeof window.CookieConsent.acceptedCategory === 'function' &&
      window.CookieConsent.acceptedCategory('marketing'));
  }

  // Službeni Meta stub (fbq red), bez učitavanja skripte.
  function installStub() {
    if (window.fbq) return;
    var n = window.fbq = function () {
      if (n.callMethod) n.callMethod.apply(n, arguments); else n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  }

  function grant() {
    active = true;
    if (!initialised) {
      installStub();
      window.fbq('set', 'autoConfig', false, PIXEL_ID); // bez automatskih događaja
      window.fbq('consent', 'grant');
      window.fbq('init', PIXEL_ID); // bez korisničkih podataka (nema advanced matchinga)
      window.fbq('track', 'PageView');
      initialised = true;
    } else {
      window.fbq('consent', 'grant');
    }
    if (!scriptAdded) {
      var s = document.createElement('script');
      s.async = true;
      s.src = SCRIPT_SRC;
      document.head.appendChild(s);
      scriptAdded = true;
    }
  }

  function eraseMetaCookies() {
    var names = document.cookie.split(';')
      .map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return n === '_fbp' || n === '_fbc'; });
    if (!names.length) return;
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) {
      var d = parts.slice(i).join('.');
      domains.push('; domain=' + d, '; domain=.' + d);
    }
    names.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; Max-Age=0; path=/' + d;
      });
    });
  }

  function revoke() {
    active = false;
    if (initialised && window.fbq) window.fbq('consent', 'revoke');
    eraseMetaCookies();
  }

  // Poziva se iz CMP-a pri svakom učitavanju s važećom privolom i pri svakoj promjeni.
  function sync() {
    if (hasConsent()) grant(); else revoke();
  }

  // Je li resource entry Metin zahtjev koji nosi ovaj događaj: GET ima
  // ev=<name> u URL-u; POST (beacon) ima podatke u tijelu, pa URL nema ev=.
  function carriesEvent(url, name) {
    if (url.indexOf('facebook.com/tr') === -1) return false;
    var m = url.match(/[?&]ev=([^&]*)/);
    return !m || m[1] === name;
  }

  // Šalje standardni Meta događaj samo ako je marketing privola dana u ovom
  // trenutku. options.callback se uvijek pozove točno jednom (bez privole
  // odmah); s privolom kad Metin zahtjev za taj događaj ZAVRŠI, a najkasnije
  // nakon options.timeout ms.
  function track(name, options) {
    options = options || {};
    var cb = typeof options.callback === 'function' ? options.callback : null;
    if (!hasConsent() || !active) {
      if (cb) cb();
      return false;
    }
    if (!initialised) grant();
    if (cb) {
      var done = false, observer = null;
      var finish = function () {
        if (done) return;
        done = true;
        if (observer) observer.disconnect();
        cb();
      };
      var sentAt = window.performance && performance.now ? performance.now() : 0;
      if (window.PerformanceObserver) {
        try {
          observer = new PerformanceObserver(function (list) {
            list.getEntries().forEach(function (e) {
              if (e.startTime >= sentAt && carriesEvent(e.name, name)) finish();
            });
          });
          observer.observe({ type: 'resource' });
        } catch (err) { observer = null; }
      }
      setTimeout(finish, options.timeout || 1000);
    }
    window.fbq('track', name); // bez parametara — ništa iz obrasca ne ide Meti
    return true;
  }

  window.SMCMeta = { sync: sync, track: track, hasConsent: hasConsent };
})();
