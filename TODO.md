# TODO 

## 1

- docs
  - generate sitemap.xml within the gruntpackage
  - use marked over pagedown _everywhere_ in main site
  - sanitize while not breaking raw HTML (laid back sanitizing, like pagedown offers)
  - tweak code, syntax highlighting https://github.com/ForbesLindesay/supermarked/blob/master/index.js
  - markdown playground.
  - docs about our editor, shortcuts, etc?

- blog
  - fonts on blog
  - email notifications for comments

- market
  - prettier header
  - video
  - subscription implementation


- fix nightmares with session, domains, and passports

- save drafts to localStorage
- allow storing drafts in backend
- redesign commenting frontend (which blows)



## 2

- blog
  - data-related author's twitter

- adaptable design ?
- proper api + authentication

- pingbacks
  - Display PingBacks on each blog entry
  - Can be disabled on a per-entry basis

- refactor:
    - drop crudService
    - refactor authenticationController, feedController
    - refactor api controllers, move logic to services, rename exports more semantically
    - css lint (and different classing philosophy)



## 3

- client-side caching?

- partition the build process so that continuous development
  doesn't re-do everything for every single file
  