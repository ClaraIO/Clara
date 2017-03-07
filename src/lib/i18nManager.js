  /*
  * Locale Manager
  *  
  *
  * Contributed by Capuccino with special thanks from GusCaplan.
  */

  const i18n = require('i18next');
  const langDir = require(`${__baseDir}/res/locales`);
  const {backend , Backend} = require('i18next-sync-fs-backend');

  class localeManager {
    constrcutor () {
    this.i18next = i18next;
    }
     i18next
      .use(Backend)
      .init({
        lng: 'en',
        fallbackLng: 'en',
        defaultNs: 'common',
        debug: false,
        initImmediate: false,
        preload: languages,
        ns: ['common', 'descriptions'],
        joinArrays: '\n',
        backend: {
          loadPath: `${langDirs}/{{lng}}/{{ns}}.json`
        },
        interpolation: {
          escapeValue: false,
          format: (value, format) => {
            if (format === 'upper') return value.toUpperCase();
            if (format === 'lower') return value.toLowerCase();
            if (format === 'capitalize') {
              return value.substr(0, 1).toUpperCase() + value.substr(1).toLowerCase();
            }
            return value;
          }
        }
      });
    }

    t(key, options) {
      if (options.random) {
        options.returnObjects = true;
        options.joinArrays = null;
      }

      const result = i18next.t(key, options);

      if (options.random) return result[Math.floor(Math.random() * result.length)];
      return result;
    }

  }    
    })
  }
  
module.exports = new localeManager;
module.exports.languages = languages;