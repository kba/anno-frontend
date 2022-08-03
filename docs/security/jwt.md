
JSON Web Tokens
===============

* [Wikipedia on JWT, section "Vulnerabilities"][wp-en-jwt-vuln]
* [Why JWT is a bad choice for login sessions][joepie-jwt1]

  [wp-en-jwt-vuln]: https://en.wikipedia.org/wiki/JSON_Web_Token#Vulnerabilities
  [joepie-jwt1]: http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/



Trade-off
---------

In our case, the only session data used is identity, so no synchronisation
of session data is required except session revocation on logout.

For the time being, we ignore that revocation part because in our risk
assessment it doesn't pose sufficient threat to warrant a software solution.
The manual solution for impersonation by stolen session is to forcibly logout
ALL users, then compare the database with a known-good backup and clean up.

