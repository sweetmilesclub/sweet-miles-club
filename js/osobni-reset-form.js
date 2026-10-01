// Sweet Miles Club — obrazac za workbook "Mojih 15 minuta — Osobni reset".
//
// Vlastiti obrazac umjesto MailerLite embeda: prije klika na "Pošalji"
// stranica ne kontaktira MailerLite i ništa ne sprema u preglednik.
// Tek na slanje ide JEDAN POST zahtjev na postojeću MailerLite formu
// "Osobni reset — forma", isti endpoint i parametri koje koristi
// MailerLiteov vlastiti embed, kako bi se zadržao okidač automatizacije
// "Completes a form".
//
// Preusmjeravanje na /hvala događa se SAMO ako MailerLite odgovori
// success:true. Svaki drugi ishod prikazuje poruku i ne preusmjerava.

(function () {
  'use strict';

  var ENDPOINT = 'https://assets.mailerlite.com/jsonp/2397490/forms/199237408030458968/subscribe';
  var GROUP_DELIVERY = '199234091369890915';   // Osobni reset — delivery (uvijek)
  var GROUP_NEWSLETTER = '199234105180686149'; // newsletter (samo uz kvačicu)
  var SUCCESS_URL = '/hvala';
  var MIN_FILL_MS = 3000;  // vremenska zamka: brže slanje od ovoga ne prolazi
  var TIMEOUT_MS = 10000;

  var MSG = {
    emailEmpty: 'Upiši svoju e-mail adresu.',
    emailInvalid: 'Provjeri e-mail adresu, čini se da nešto nedostaje.',
    emailRejected: 'Ta e-mail adresa nije prihvaćena. Provjeri je i pokušaj ponovno.',
    tooFast: 'Samo trenutak. Pokušaj ponovno za nekoliko sekundi.',
    network: 'Slanje nije uspjelo. Provjeri internetsku vezu i pokušaj ponovno.',
    server: 'Nešto je pošlo krivo i prijava nije zaprimljena. Pokušaj ponovno malo kasnije.',
    sending: 'Šaljem…'
  };

  var form = document.getElementById('resetForm');
  if (!form) return;

  var email = document.getElementById('resetEmail');
  var emailError = document.getElementById('resetEmailError');
  var newsletter = document.getElementById('resetNewsletter');
  var honeypot = document.getElementById('resetHpField');
  var message = document.getElementById('resetFormMessage');
  var button = form.querySelector('.reset-submit');
  var buttonLabel = button.textContent;

  var loadedAt = Date.now();
  var sending = false;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Skripta je učitana: obrazac se smije koristiti.
  button.disabled = false;

  function setEmailError(text) {
    emailError.textContent = text || '';
    if (text) {
      email.setAttribute('aria-invalid', 'true');
    } else {
      email.removeAttribute('aria-invalid');
    }
  }

  function setMessage(text) {
    message.textContent = text || '';
  }

  function setSending(state) {
    sending = state;
    button.disabled = state;
    button.setAttribute('aria-busy', state ? 'true' : 'false');
    button.textContent = state ? MSG.sending : buttonLabel;
  }

  // GA4 (samo uz analytics privolu, preko js/analytics.js). Nikad se ne šalje
  // e-mail ni bilo koji identifikator osobe ili MailerLite forme.
  function analyticsTrack(name, params, options) {
    if (window.SMCAnalytics) return window.SMCAnalytics.track(name, params, options);
    if (options && typeof options.callback === 'function') options.callback();
    return false;
  }

  // Meta Pixel (samo uz marketing privolu, preko js/meta-analytics.js).
  // Šalje se samo standardni događaj, bez ikakvih podataka iz obrasca.
  function metaTrack(name, options) {
    if (window.SMCMeta) return window.SMCMeta.track(name, options);
    if (options && typeof options.callback === 'function') options.callback();
    return false;
  }

  // form_start: jednom po učitavanju stranice, na prvi fokus u e-mail polje.
  // Ako privola u tom trenutku nije dana, događaj se gubi (ne šalje se kasnije).
  var formStarted = false;
  email.addEventListener('focus', function () {
    if (formStarted) return;
    formStarted = true;
    analyticsTrack('form_start', { form_location: 'osobni_reset_page' });
  });

  email.addEventListener('input', function () {
    if (emailError.textContent) setEmailError('');
    if (message.textContent) setMessage('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (sending) return;

    setMessage('');
    var value = email.value.trim();

    if (!value) {
      setEmailError(MSG.emailEmpty);
      email.focus();
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setEmailError(MSG.emailInvalid);
      email.focus();
      return;
    }
    setEmailError('');

    // Zamke za botove. Poruka je vidljiva, pa čovjek koji slučajno
    // "upadne" u zamku ne ostaje bez objašnjenja.
    if (honeypot.value !== '' || Date.now() - loadedAt < MIN_FILL_MS) {
      setMessage(MSG.tooFast);
      return;
    }

    var params = new URLSearchParams();
    params.append('fields[email]', value);
    params.append('groups[]', GROUP_DELIVERY);
    var optedIn = newsletter.checked;
    if (optedIn) params.append('groups[]', GROUP_NEWSLETTER);
    params.append('ml-submit', '1');
    params.append('anticsrf', 'true');
    params.append('ajax', '1');

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    setSending(true);

    // POST s podacima u tijelu (application/x-www-form-urlencoded):
    // e-mail nije u URL-u, pa ne završava u logovima adresa. Ovakav
    // zahtjev je "jednostavan" CORS zahtjev, bez preflighta.
    fetch(ENDPOINT, {
      method: 'POST',
      body: params,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) {
          var httpError = new Error('http ' + response.status);
          httpError.name = 'ServerError';
          throw httpError;
        }
        return response.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        if (data && data.success === true) {
          // Gumb ostaje u stanju "Šaljem…" dok se /hvala učitava.
          // Lead događaji tek ovdje: MailerLite je potvrdio success:true.
          // Bez analytics privole preusmjeravanje je trenutno; s privolom
          // čeka potvrdu slanja najviše ~1 s.
          var redirected = false;
          var goToThanks = function () {
            if (redirected) return;
            redirected = true;
            window.location.assign(SUCCESS_URL);
          };
          // Preusmjeravanje tek kad su GA4 i Meta gotovi (svaki najviše 1 s;
          // bez odgovarajuće privole svaki javlja "gotovo" odmah).
          var pending = 2;
          var oneDone = function () { if (--pending === 0) goToThanks(); };
          metaTrack('Lead', { callback: oneDone, timeout: 1000 });
          if (optedIn) analyticsTrack('newsletter_opt_in', { lead_source: 'osobni_reset' });
          analyticsTrack('generate_lead', {
            lead_source: 'osobni_reset',
            form_location: 'osobni_reset_page'
          }, { callback: oneDone, timeout: 1000 });
          return;
        }
        setSending(false);
        var fields = data && data.errors && data.errors.fields;
        if (fields && fields.email) {
          setEmailError(MSG.emailRejected);
          email.focus();
        } else {
          setMessage(MSG.server);
        }
      })
      .catch(function (error) {
        clearTimeout(timer);
        setSending(false);
        // Greška poslužitelja ili neispravan odgovor → poruka "server";
        // mreža, timeout ili CORS → poruka "network". Nikad bez poruke.
        var serverSide = error && (error.name === 'ServerError' || error.name === 'SyntaxError');
        setMessage(serverSide ? MSG.server : MSG.network);
      });
  });
})();
