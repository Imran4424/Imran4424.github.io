# Shah Md. Imran Hossain — Portfolio

A responsive, static portfolio for an iOS software engineer, published at [imran4424.github.io](https://imran4424.github.io/). It uses HTML, CSS, and dependency-free JavaScript, with no build step. Content and navigation remain available when JavaScript is disabled.

## Preview locally

From the repository root, run:

```sh
python -m http.server 4173
```

Open [localhost:4173](http://localhost:4173/). Stop the server with `Ctrl+C`.

## Files

- `index.html`: page content, project cards, experience, writing, contact links, and metadata.
- `css/style.css`: visual design and component styles.
- `css/responsive.css`: adjustments for phone, tablet, and desktop layouts.
- `js/script.js`: mobile navigation, project filters, current year, section indication, and copy-email enhancement.
- `assets/` and `images/`: locally served images and downloadable files.
- `AppStore/`, `GooglePlay/`, and `Others/GooglePlay/`: existing app privacy policies and terms.
- `Others/WebApp/ToDoList/`: existing standalone demo.
- `app-ads.txt`: app advertising configuration.

## Update content

Edit the semantic sections in `index.html`. To add a project, duplicate an existing `[data-project]` card inside `.project-grid`, give it `data-category="ios"` or `data-category="android"`, and update its title, description, image alternative text, and verified destination link. All projects display by default; JavaScript adds the optional category filters.

Keep contact information consistent between the visible email link and the copy button's `data-email` attribute. Replace the linked CV when experience changes. Check the page at narrow phone widths, tablet widths, small desktop widths, and a wide monitor before publishing.

The writing section features the **C++ In Depth** and **A starting point for beginners** tutorial collections on GitHub, followed by all five blog topics and one article from each with its original publication date. Keep the selection representative when updating it; verify tutorial scope against the repositories and blog titles, dates, and URLs against the public post data.

The November 9, 2026 content refresh uses the supplied **Shah_Md_Imran_Hossain_iOS_CV.pdf**, [GitHub profile](https://github.com/Imran4424), [Shah Coder's Den](https://shahcodersden.com/), and [Luminous Inc. on Google Play](https://play.google.com/store/apps/developer?id=Luminous+Inc.). Update dated experience and project information against those sources; avoid adding unverified metrics.

The nine selected projects include three iOS apps (Lif, A1 Canvas, and Noksha) and six Android apps (Power, Slidelock, DeskPulse, Tiny Dance Tracker, Wordlytic, and Tide Racer). Filter counts are calculated from the project cards. A1 Canvas and Noksha are marked as previously published; Lif credits the co-development role described in the CV. The [content audit](docs/content-audit.md) records source coverage and confirmations for future updates.

App icons and Lif previews are from the official store listings. `assets/images/imran-hossain.jpg` is an optimized copy of the updated photo supplied by Imran; the original file is unchanged. DM Sans and Instrument Serif are self-hosted in `assets/fonts/`, alongside their OFL licenses. The homepage makes no external font or image requests.

## GitHub Pages

Keep GitHub Pages configured to serve the repository's existing publishing branch and root directory. The site requires no npm install, compilation, or server-side application. Publishing follows the repository's existing GitHub Pages workflow when changes reach its configured branch.

Preserve existing privacy-policy and terms URLs, including their casing and directory names, plus `app-ads.txt`. App store listings and installed apps may depend on these exact paths. Do not remove legacy standalone pages as part of a homepage update.
