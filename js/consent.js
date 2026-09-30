// Sweet Miles Club — postavke kolačića (CMP).
//
// Biblioteka: vanilla-cookieconsent 3.1.0, self-hosted u /vendor/cookieconsent.
// Izbor se sprema u first-party kolačić "cc_cookie" na ovoj domeni.
//
// Kategorije:
//   necessary  — uvijek uključena, ne može se isključiti
//   analytics  — Google Analytics 4 (js/analytics.js), samo uz privolu
//   marketing  — rezervirano za buduće oglasne alate (trenutno nema aktivnih servisa)
//
// GA4 se ne učitava preko data-category skripte nego preko js/analytics.js:
// onConsent / onChange pozivaju SMCAnalytics.sync(), koji učitava ili gasi GA.
//
// REVISION: podiže se samo kad se promijeni opseg VEĆ OBJAVLJENE privole
// (npr. novi alat u kategoriji koju su posjetitelji već prihvatili).
// Prvi produkcijski CMP izlazi zajedno s GA4, pa ostaje 1.

(function () {
  'use strict';

  if (!window.CookieConsent) return;

  var REVISION = 1;

  window.CookieConsent.run({
    revision: REVISION,

    cookie: {
      name: 'cc_cookie',
      expiresAfterDays: 182,
      sameSite: 'Lax'
    },

    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        equalWeightButtons: true,
        flipButtons: false
      }
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true
      },
      analytics: {
        autoClear: {
          cookies: [{ name: /^_ga/ }]
        }
      },
      marketing: {}
    },

    onConsent: function () {
      if (window.SMCAnalytics) window.SMCAnalytics.sync();
    },
    onChange: function () {
      if (window.SMCAnalytics) window.SMCAnalytics.sync();
    },

    language: {
      default: 'hr',
      translations: {
        hr: {
          consentModal: {
            title: 'Kolačići na Sweet Miles Clubu',
            description:
              'Koristim samo ono što je nužno da stranica radi i da zapamti tvoj izbor. ' +
              'Uz tvoju privolu koristim i Google Analytics, kako bih vidjela koji je sadržaj koristan. ' +
              'Marketinške alate trenutno ne koristim. ' +
              'Izbor možeš promijeniti bilo kada preko poveznice „Postavke kolačića” u podnožju stranice.',
            acceptAllBtn: 'Prihvati sve',
            acceptNecessaryBtn: 'Odbij sve',
            showPreferencesBtn: 'Prilagodi',
            footer:
              '<a href="/privatnost">Privatnost</a>' +
              '<a href="/kolacici">Kolačići</a>'
          },
          preferencesModal: {
            title: 'Postavke kolačića',
            acceptAllBtn: 'Prihvati sve',
            acceptNecessaryBtn: 'Odbij sve',
            savePreferencesBtn: 'Spremi odabir',
            closeIconLabel: 'Zatvori',
            serviceCounterLabel: 'usluga|usluge',
            sections: [
              {
                title: 'Tvoj izbor',
                description:
                  'Ovdje biraš koje kategorije kolačića Sweet Miles Club smije koristiti. ' +
                  'Nužni su uvijek uključeni jer omogućuju osnovne funkcije stranice i pamćenje tvojeg izbora privatnosti. ' +
                  'Ostale kategorije su isključene dok ih sama ne uključiš.'
              },
              {
                title: 'Nužni',
                description:
                  'Omogućuju osnovne funkcije stranice i pamte tvoj izbor u ovim postavkama ' +
                  '(kolačić cc_cookie). Ne mogu se isključiti.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Analitički',
                description:
                  'Google Analytics 4 bilježi koje stranice čitaš, odakle dolaziš i koje poveznice koristiš, ' +
                  'kako bih znala koji je sadržaj koristan. Postavlja kolačiće _ga i _ga_*. ' +
                  'Ne šaljem mu tvoju e-mail adresu ni ime.',
                linkedCategory: 'analytics'
              },
              {
                title: 'Marketinški',
                description:
                  'Služili bi za mjerenje i prikazivanje oglasa na drugim platformama. ' +
                  'Trenutno se ne koristi nijedan marketinški alat.',
                linkedCategory: 'marketing'
              },
              {
                title: 'Više informacija',
                description:
                  'Detalje o kolačićima i obradi podataka pronaći ćeš na stranicama ' +
                  '<a href="/kolacici">Kolačići</a> i <a href="/privatnost">Privatnost</a>. ' +
                  'Za pitanja piši na <a href="mailto:hello@sweetmilesclub.com">hello@sweetmilesclub.com</a>.'
              }
            ]
          }
        }
      }
    }
  });
})();
