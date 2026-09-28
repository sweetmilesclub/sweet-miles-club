// Sweet Miles Club — obrazac za workbook "Mojih 15 minuta — Osobni reset".
//
// Vlastiti obrazac umjesto MailerLite embeda: prije klika na "Pošalji"
// stranica ne kontaktira MailerLite i ništa ne sprema u preglednik.
// Tek na slanje ide JEDAN zahtjev na postojeću MailerLite formu
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
    if (newsletter.checked) params.append('groups[]', GROUP_NEWSLETTER);
    params.append('ml-submit', '1');
    params.append('anticsrf', 'true');
    params.append('ajax', '1');

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    setSending(true);

    fetch(ENDPOINT + '?' + params.toString(), {
      method: 'GET',
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
          window.location.assign(SUCCESS_URL);
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
