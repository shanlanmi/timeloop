/**
 * This is the options of a request, using by gulp task 'default' with option `-a`
 */
module.exports = {
  baseUrl: 'http://127.0.0.1:3100/api/',
  uri: 'Timelogs/month',
  method: "GET",
  headers: {
    // 'X-USER-EMAIL': 'stella@example.com',
    // 'X-USER-TOKEN': '3jcYXUbE5fxKAza_k959',
  },
  /**
   * note: we need use snakeCase in qs
   */
  qs: {
    period: 4
    // page: 1,
    // per_page: 2,
  },
};
