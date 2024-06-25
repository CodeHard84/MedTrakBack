const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const dotenv = require('dotenv');

dotenv.config();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-1iftv5mchggiriqw.us.auth0.com/.well-known/jwks.json`
  }),
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

module.exports = checkJwt;
