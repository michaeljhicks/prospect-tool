# Iceworks old-invitation redirect site

This repository is only for preserving pre-migration links sent to prospects and staff.

The Iceworks portal itself belongs at `iceworks-franchise-group/prospect-tool`, published at `https://discover.iceworksus.com`.

## Deploy
1. Upload all six `.html` files into the root of the PERSONAL `michaeljhicks/prospect-tool` repository (not the Iceworks organization repository). Do not upload the ZIP itself.
2. In the personal repository, open Settings -> Pages. Choose "Deploy from a branch", branch `main`, folder `/(root)`, then Save.
3. Test `https://michaeljhicks.github.io/prospect-tool/index.html#invite=FAKE_TOKEN_FOR_PATH_TEST` in a browser. It must redirect to `https://discover.iceworksus.com/index.html#invite=FAKE_TOKEN_FOR_PATH_TEST` (the test token will not load a valid invitation, which is expected).
4. Also check `capital-readiness.html#invite=FAKE_TOKEN_FOR_PATH_TEST` and `capital-admin.html`.
5. When HTTPS and the legitimate new site are ready, test one genuine existing invitation and confirm opens and Begin Exploring tracking.

The redirect uses JavaScript because the `#invite=...` fragment is not sent to GitHub's servers. It passes the fragment unchanged to the new site, with no analytics or token storage.

Do NOT point a `CNAME` file in this personal repository at `discover.iceworksus.com`. That custom domain belongs to the company-owned repository.
