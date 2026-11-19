# bivid.site

Jerson Ombina’s portfolio and the public landing pages for Ping, CutLog, and basics. Built with static HTML/CSS/JavaScript; there is no package installation or compilation step.

## Pages

| Project | Landing | Privacy Policy | Terms of Service |
| --- | --- | --- | --- |
| Portfolio | https://bivid.site/ | — | — |
| Ping | https://bivid.site/ping/ | https://bivid.site/ping/privacy/ | https://bivid.site/ping/terms/ |
| CutLog | https://bivid.site/cutlog/ | https://bivid.site/cutlog/privacy/ | https://bivid.site/cutlog/terms/ |
| basics. | https://bivid.site/basics/ | https://biiviid.github.io/basics/privacy-policy.html | https://bivid.site/basics/terms/ |

`index.html` contains the portfolio. `ping/`, `cutlog/`, and `basics/` contain the app pages and their assets. The `*SS/` folders retain portfolio screenshots. basics.’s canonical Privacy Policy is published from its separate public repository and is linked directly from its landing page and app.

## Local preview

From this directory, run `python3 -m http.server 8080 --bind 127.0.0.1`, then open `http://127.0.0.1:8080/`. Keep the repository root as the server root so the portfolio links and shared screenshot paths resolve correctly. Check the three app paths and legal pages before publishing changes.

## Publishing

The existing public host is GitHub Pages with the `bivid.site` custom domain (`CNAME`). Use a scoped branch and review the changed paths before merging. Verify the Pages build and the public HTML/assets after publication. Do not upload signing keys, private configuration, or application source as part of a website update.

## Assets and release links

Font notices are included with their assets: `basics/assets/Orbitron-OFL.txt`, `cutlog/assets/SpaceGrotesk-OFL.txt`, and `ping/assets/OFL-Manrope.txt`. CutLog’s nutrition-source notice is `cutlog/assets/nutrition-sources.txt`.

Ping’s install route is an invitation-only Firebase tester page. CutLog’s previous APK link is paused while an updated signed release is prepared; do not restore it until the linked artifact contains the cleared catalog and fixes. basics. has no published Play listing linked yet. These landing pages do not publish an Android build automatically.

The portfolio loads Google Fonts and a Cloudflare analytics beacon. The app landing pages self-host their fonts and do not contain forms or analytics scripts. Hosting services and external links have their own privacy practices.
