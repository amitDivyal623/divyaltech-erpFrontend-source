export const environment = {
  enableDebug: false,
  production: true,
  APIEndpoint: 'http://api.divyaltech.com/index.cfm?action=',
  Error: 'http://erp.divyaltech.com/',
  bypassOTP: false,
  apiCryptoVersion: 2,
  apiCryptoSecret: 'iZNFPZ2cKskZLhB29fdOT+tj8FHRsmjCdLq+n6awmXhg4RnuzPdCpImMDYuoWCtK',
  // Frontend manual-restart UI removed (2026-07-27) - server-side watchdog/CGI script
  // still run independently. Kept here, commented, in case the frontend button is
  // reintroduced later. Must match RESTART_TOKEN in restart.sh on the server exactly.
  // lucRestartCgiUrl: 'http://api.divyaltech.com/cgi-lucee/restart.sh',
  // lucRestartToken: '064ce5c5486c0dbda9e15f454e1c913b0c503c632e4249bb7cb829369af621f2'
};