// Sweet Miles Club — postavke kolačića (CMP).
//
// Biblioteka: vanilla-cookieconsent 3.1.0, self-hosted u /vendor/cookieconsent.
// Izbor se sprema u first-party kolačić "cc_cookie" na ovoj domeni.
//
// Kategorije:
//   necessary  — uvijek uključena, ne može se isključiti
//   analytics  — Google Analytics 4 (js/analytics.js), samo uz privolu
//   marketing  — Meta Pixel (js/meta-analytics.js), samo uz privolu
//
// GA4 i Meta Pixel ne učitavaju se preko data-category skripti nego preko
// js/analytics.js i js/meta-analytics.js: onConsent / onChange pozivaju
// SMCAnalytics.sync() i SMCMeta.sync(), koji učitavaju ili gase svaki alat.
//
// REVISION: podiže se samo kad se promijeni opseg VEĆ OBJAVLJENE privole
// (npr. novi alat u kategoriji koju su posjetitelji već prihvatili).
// 1 = GA4 (30. 9. 2026.). 2 = uveden Meta Pixel u kategoriji marketing, pa
// svi ponovno biraju.

(function () {
  'use strict';

  if (!window.CookieConsent) return;

  var REVISION = 2;

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
      marketing: {
        autoClear: {
          cookies: [{ name: /^_fbp$/ }, { name: /^_fbc$/ }]
        }
      }
    },

    onConsent: function () {
      if (window.SMCAnalytics) window.SMCAnalytics.sync();
      if (window.SMCMeta) window.SMCMeta.sync();
    },
    onChange: function () {
      if (window.SMCAnalytics) window.SMCAnalytics.sync();
      if (window.SMCMeta) window.SMCMeta.sync();
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
              'Uz posebnu privolu koristim i Meta Pixel, za mjerenje učinka oglasa na Facebooku i Instagramu. ' +
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
                  'Meta Pixel (Meta Platforms) mjeri učinak mojih oglasa na Facebooku i Instagramu: ' +
                  'je li posjet ili prijava za workbook došla iz oglasa. Može služiti i za prikazivanje oglasa ' +
                  'ljudima koji su već posjetili stranicu (remarketing), ako takvu publiku postavim. ' +
                  'Postavlja kolačiće _fbp i _fbc. ' +
                  'Ne šaljem mu tvoju e-mail adresu, ime ni ono što upišeš u obrazac.',
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
