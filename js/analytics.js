// Sweet Miles Club — Google Analytics 4 uz Basic Consent Mode.
//
// Pravila:
// - Prije privole za kategoriju "analytics" stranica NE učitava Googleov kod,
//   ne kontaktira googletagmanager.com / google-analytics.com i ništa ne
//   stavlja u dataLayer. Događaj nastao prije privole se gubi — nikad se ne
//   šalje naknadno.
// - Nakon privole: consent default (sve denied) → update analytics_storage
//   granted → učitavanje gtag.js. Svi ad_* signali ostaju denied (nema
//   marketing tagova).
// - Povlačenje privole: GA se odmah isključuje (ga-disable), consent se vraća
//   na denied i brišu se kolačići _ga i _ga_*.
// - Nikad se ne šalju osobni podaci (e-mail, ime, ID-evi pretplatnice ili
//   forme, consentId).
//
// Povezano s CMP-om preko js/consent.js (onConsent / onChange → sync()).

(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-CH0ETDKF4C';
  // debug_mode SAMO na poznatim testnim hostovima (Cloudflare Preview, lokalno).
  // Svaki drugi host — sweetmilesclub.com, www, bilo koja buduća domena —
  // tretira se kao produkcija i nikad ne dobiva debug_mode.
  var host = location.hostname;
  var IS_DEBUG_HOST = /\.pages\.dev$/.test(host) ||
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  var DISABLE_FLAG = 'ga-disable-' + MEASUREMENT_ID;

  var initialised = false; // consent default + config poslani (samo nakon privole)
  var scriptAdded = false;

  function gtag() { window.dataLayer.push(arguments); }

  function hasConsent() {
    return !!(window.CookieConsent &&
      typeof window.CookieConsent.acceptedCategory === 'function' &&
      window.CookieConsent.acceptedCategory('analytics'));
  }

  function grant() {
    window[DISABLE_FLAG] = false;
    if (!initialised) {
      window.dataLayer = window.dataLayer || [];
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      gtag('set', 'ads_data_redaction', true);
      gtag('consent', 'update', { analytics_storage: 'granted' });
      gtag('js', new Date());
      var config = { allow_google_signals: false, allow_ad_personalization_signals: false };
      if (IS_DEBUG_HOST) config.debug_mode = true; // Preview → DebugView
      gtag('config', MEASUREMENT_ID, config);
      initialised = true;
    } else {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!scriptAdded) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
      document.head.appendChild(s);
      scriptAdded = true;
    }
  }

  function eraseGaCookies() {
    var names = document.cookie.split(';')
      .map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return n === '_ga' || n.indexOf('_ga_') === 0; });
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
    window[DISABLE_FLAG] = true; // zaustavlja i automatske (Enhanced Measurement) događaje
    if (initialised) gtag('consent', 'update', { analytics_storage: 'denied' });
    eraseGaCookies();
  }

  // Poziva se iz CMP-a pri svakom učitavanju s važećom privolom i pri svakoj promjeni.
  function sync() {
    if (hasConsent()) grant(); else revoke();
  }

  // Šalje događaj samo ako je analytics privola dana u ovom trenutku.
  // options.callback se uvijek pozove točno jednom (i bez privole, odmah),
  // najkasnije nakon options.timeout ms.
  function track(name, params, options) {
    options = options || {};
    var cb = typeof options.callback === 'function' ? options.callback : null;
    if (!hasConsent() || window[DISABLE_FLAG] === true) {
      if (cb) cb();
      return false;
    }
    if (!initialised) grant();
    var payload = {};
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
    if (cb) {
      var done = false;
      var finish = function () { if (!done) { done = true; cb(); } };
      var timeout = options.timeout || 1000;
      payload.event_callback = finish;
      payload.event_timeout = timeout;
      setTimeout(finish, timeout + 50);
    }
    gtag('event', name, payload);
    return true;
  }

  // cta_click — jedan listener za sve elemente s data-cta.
  function linkTarget(el) {
    var href = el.getAttribute('href') || '';
    if (href.charAt(0) === '#') return href;
    try {
      var u = new URL(href, location.href);
      return u.pathname + (u.hash || '');
    } catch (e) { return ''; }
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (!el) return;
    var text = (el.textContent || '').replace(/[→←]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
    track('cta_click', {
      cta_id: el.getAttribute('data-cta'),
      cta_text: text,
      cta_location: el.getAttribute('data-cta-location') || '',
      link_url: linkTarget(el)
    });
  });

  window.SMCAnalytics = { sync: sync, track: track, hasConsent: hasConsent };
})();
