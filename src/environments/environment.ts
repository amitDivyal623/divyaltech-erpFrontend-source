// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   APIEndpoint: 'http://dev-api.divyaltech.com/index.cfm?action=',
//   Error: 'http://localhost:4200/'
// };

export const environment = {
  production: false,
  APIEndpoint: 'http://dev-api.divyaltech.com/dev-backend/index.cfm?action=',
  Error: 'http://localhost:4200/',
  bypassOTP: true,
  apiCryptoVersion: 2,
  apiCryptoSecret: 'rl7tR1gnHeX4Z5WnrfvkHUS2urp95maZt53e90VyrOGHQOZHHdXDpfftZRkdu48l',
  // Frontend manual-restart UI removed (2026-07-27) - server-side watchdog/CGI script
  // still run independently. Kept here, commented, in case the frontend button is
  // reintroduced later. Must match RESTART_TOKEN in restart.sh on the server exactly.
  // lucRestartCgiUrl: 'http://dev-api.divyaltech.com/cgi-lucee/restart.sh',
  // lucRestartToken: '064ce5c5486c0dbda9e15f454e1c913b0c503c632e4249bb7cb829369af621f2'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
