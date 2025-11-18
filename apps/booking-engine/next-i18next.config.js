module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',    // English
      'es',    // Spanish
      'fr',    // French
      'de',    // German
      'it',    // Italian
      'pt',    // Portuguese
      'zh',    // Chinese (Simplified)
      'ja',    // Japanese
      'ko',    // Korean
      'ar',    // Arabic (RTL)
      'he',    // Hebrew (RTL)
      'ru',    // Russian
      'hi',    // Hindi
      'th',    // Thai
      'tr',    // Turkish
      'nl',    // Dutch
    ],
    localeDetection: true,
  },
  fallbackLng: {
    default: ['en'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
