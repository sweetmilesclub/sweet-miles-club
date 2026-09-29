// Sweet Miles Club — postavke kolačića (CMP).
//
// Biblioteka: vanilla-cookieconsent 3.1.0, self-hosted u /vendor/cookieconsent.
// Izbor se sprema u first-party kolačić "cc_cookie" na ovoj domeni.
//
// Kategorije:
//   necessary  — uvijek uključena, ne može se isključiti
//   analytics  — za buduće mjerenje posjećenosti (trenutno nema aktivnih servisa)
//   marketing  — za buduće oglasne alate (trenutno nema aktivnih servisa)
//
// Kad se uvede prvi analitički ili marketinški alat:
//   1. njegova skripta dobiva type="text/plain" data-category="analytics|marketing",
//      pa je biblioteka pokreće tek nakon privole;
//   2. REVISION se povećava za 1, da svi posjetitelji ponovno odluče,
//      jer raniji "Prihvati sve" nije uključivao taj alat.

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
      analytics: {},
      marketing: {}
    },

    language: {
      default: 'hr',
      translations: {
        hr: {
          consentModal: {
            title: 'Kolačići na Sweet Miles Clubu',
            description:
              'Koristim samo ono što je nužno da stranica radi i da zapamti tvoj izbor. ' +
              'Analitičke i marketinške kolačiće koristila bih samo uz tvoju privolu, a trenutno ih nema. ' +
              'Izbor možeš promijeniti bilo kada preko poveznice „Postavke kolačića” u podnožju stranice.',
            acceptAllBtn: 'Prihvati sve',
            acceptNecessaryBtn: 'Odbij sve',
            showPreferencesBtn: 'Prilagodi',
            footer:
              '<a href="privatnost.html">Privatnost</a>' +
              '<a href="kolacici.html">Kolačići</a>'
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
                  'Služili bi za mjerenje posjećenosti, kako bih znala koji je sadržaj koristan. ' +
                  'Trenutno se ne koristi nijedan analitički alat.',
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
                  '<a href="kolacici.html">Kolačići</a> i <a href="privatnost.html">Privatnost</a>. ' +
                  'Za pitanja piši na <a href="mailto:hello@sweetmilesclub.com">hello@sweetmilesclub.com</a>.'
              }
            ]
          }
        }
      }
    }
  });
})();
