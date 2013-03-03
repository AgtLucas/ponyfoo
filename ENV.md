Environment Variables
=====================

A good place to configure Node.js environment variables is the JetBrains IDE for Node.js, [**WebStorm**](http://www.jetbrains.com/webstorm/). Note that most of these have default values, which might come either from Node.js or from the configuration file for **NBrut**

Required
--------

These are the environment variables that are an _absolute must_ for **NBrut** to run.

- No environment variables are required to installing **NBrut**.



Hosting
-------

These variables are usually very important for **deployments**, but the default values are _Ok_ in the development environment.

- **NODE_ENV**: Node.js environment, defaults to `'development'`, options include `'staging'` and `'production'`. By default, production environments minify and bundle assets, compress responses, while the development environment uses unminified sources and provides a few more features for debugging.
- **HOST_TLD**: The `TLD` for the site, this is important when slugging, because every blog is hosted on a subdomain. Defaults to `'local-sandbox.com'`.
- **HOST_SLUG_ENABLED**: Enables blog slugging. When disabled, users can't create their own blogs on the platform. Defaults to `false`.
- **HOST_SLUG_DEFAULT**: The default `slug` for the site, that is, the **semantic root** of the site. Defaults to `'www'`.
- **HOST_SLUG_REGEX**: An optional regex to restrict the subdomains that are available to users. Implicitly adds `'^'` and `'$'` to the regex. Requests that fail a test against this regex get permanently redirected to the default slug. By default it's unrestricted.
- **HOST_REGEX**: An optional regex to restrict the host. Useful when your site is accessible through multiple `TLD`s but you only want one to serve responses. When a request matches this regex, it gets permanently redirected to the same url on the default TLD.
- **PORT**: The actual port where the application will listen on. Defaults to port `8081`.
- **PUBLIC_PORT**: The public facing port. Sometimes, production environments use architectures set up with load balancers and assign ports arbitrarily to your application, but the domain will still use port `80`, this helps avoid issues when redirecting requests. Defaults to `PORT`.

- **MONGO_URI** (or **MONGOLAB_URI**): The connection uri to your MongoDB server. Defaults to `'mongodb://localhost/nbrut'`.



API Credentials
---------------

There isn't a lot to say about API credentials. These are required in order to work with various APIs.

- **FACEBOOK_APP_ID**: Your [**Facebook**](https://developers.facebook.com/apps) application ID. Used by the authentication provider.
- **FACEBOOK_APP_SECRET**: Your [**Facebook**](https://developers.facebook.com/apps) application secret. Used by the authentication provider.

- **GITHUB_CLIENT_ID**: Your [**GitHub**](https://github.com/settings/applications) client ID. Used by the authentication provider.
- **GITHUB_CLIENT_SECRET**: Your [**GitHub**](https://github.com/settings/applications) client secret. Used by the authentication provider.

- **LINKEDIN_API_KEY**: Your [**LinkedIn**](https://www.linkedin.com/secure/developer) API key. Used by the authentication provider.
- **LINKEDIN_API_SECRET**: Your [**LinkedIn**](https://www.linkedin.com/secure/developer) API secret. Used by the authentication provider.

- **IMGUR_API_KEY**: Your [**imgur**](https://imgur.com/register/api_anon) API key. Used by **file uploads**, if `undefined`, images will be uploaded to `/img/uploads`.



Incidental
----------

You shouldn't need to touch these, but you can, of course.

- **ZOMBIE_CRAWLER**: Whether or not to configure a headless browser to yield something other than a bunch of templates when a crawler hits the site. By default, this is set to true.

- **SALT_WORK_FACTOR**: Your choice of a salt work factor for [**bcrypt**](https://github.com/ncb000gt/node.bcrypt.js) encryption, shouldn't need to edit.

- **SESSION_SECRET**: Your session storage secret key.

- **FEED_ADDR**: Instead of serving the default, raw RSS feed XML, you could want to proxy it on something like [**Feedburner**](http://feedburner.com/), in that case `FEED_ADDR` should be set to the link to that feed.

- **NEW_RELIC_LICENSE_KEY**: Your New Relic license key, in case you're into monitoring your application.
- **NEW_RELIC_NO_CONFIG_FILE**: Must be set to `'true'` so that the New Relic agent works properly with **NBrut**