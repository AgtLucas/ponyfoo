# TODO 

## 1

- fix nightmares with session, domains, and passports

- profile edit allows to turn notifications for comments on or off.
- profile edit allows to subscribe or unsubscribe from blog



## 2

- re-do REST api. add oauth

- blog
  - autosave drafts to localStorage periodically (5s~)
  - allow perm. storing drafts in backend
  - redesign commenting frontend (which blows)
  - anon commenting option.
  - font consistency in blog (mac)
  - data-related author's twitter, take from req.blogger
  - list users only for back-end people, not any blogger
  - footer for blog similar to www and docs
  - adaptable design ?

- market
  - prettier header
  - video
  - subscription implementation

- docs
  - markdown playground.
  - docs about our editor, shortcuts, etc?

- server
  - basic auth
  - clustered domains
  - port watch
  - persistent logging

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
  