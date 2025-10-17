# Extract (alpha)

Extract uses AI to unlock historical planning data, built in partnership between MHCLG's Planning Data team and the Incubator for AI. 

Read more on [MHCLG's blog](https://mhclgdigital.blog.gov.uk/2025/06/12/extract-using-ai-to-unlock-historic-planning-data/) and [Incubator for AI's project page](https://ai.gov.uk/projects/extract/).

---

This repository contains two main parts:

- The root folder is a [GOV.UK Design History template](https://x-govuk.github.io/govuk-design-history/) used for documenting Extract's design history, weeknotes, decision records, and other project documentation. It's built with the [GOV.UK Eleventy plugin](https://x-govuk.github.io/govuk-eleventy-plugin/).
- The `prototypes/` folder contains prototypes built using the [GOV.UK Prototype Kit](https://x-govuk.github.io/govuk-eleventy-plugin/) (with thanks to [Joe Lanman](https://github.com/joelanman) for the [starter kit for GitHub Codespaces](https://github.com/joelanman/govuk-prototype-kit-prototype)). These are interactive prototype apps you can run locally.

This README explains how to run the site and prototypes on your machine and how to open the project in a GitHub Codespace (an easy option for people who don't want to install toolchains locally).

## Quick overview

- Technology in the root: Eleventy static site generator, Sass for styles, `@x-govuk/govuk-eleventy-plugin`.
- Technology in `prototypes/`: GOV.UK Prototype Kit, govuk-frontend.

You'll usually do one of these:

- Run the design-history site locally (root).
- Run the prototype app(s) in `prototypes/`.

## Prerequisites (local machine)

- Node.js 22 or newer (the project declares `node >=22`). If you don't have Node.js installed, use the official installer from nodejs.org or a version manager such as nvm.
- Git (to clone the repo), and a terminal that supports bash.

If you don't want to install Node.js locally, use a GitHub Codespace — steps are below.

## Running the design history site (root)

1. Clone the repository and open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Build the site once:

```bash
npm run build
```

4. Start the local development server with live reload:

```bash
npm start
```

This runs Eleventy with --serve which will build the site and serve it at a local address (usually http://localhost:8080 or a port printed by Eleventy). You can edit files in `app/` and the server will refresh.

5. To preview the built `_site` folder with a static file server instead of Eleventy's built-in server, run:

```bash
npm run serve
```

Notes:

- `npm run build` builds the site into the `_site` folder.
- `npm start` runs Eleventy in serve mode for development.
- The root `package.json` also includes `npm run preserve` (alias to `build`) and `npm test` which runs a JS style check.

## Running the prototypes (prototypes/)

The prototypes use the GOV.UK Prototype Kit. Change into the `prototypes/` folder first:

```bash
cd prototypes
```

Install dependencies there:

```bash
npm install
```

Available scripts (from `prototypes/package.json`):

- `npm run dev` — runs the prototype kit CLI in development mode. Use this when editing prototypes.
- `npm run start` — starts the prototype kit server (alternate command).
- `npm run serve` — included but note there appears to be a stray quote in the script in the repository; if you copy it exactly it may fail. Prefer `npm run start` or `npm run dev`.

Typical workflow:

```bash
cd prototypes
npm install
npm run dev
```

The prototype server will print a local URL (usually http://localhost:3000). Open it in your browser to interact with the prototype.

## Running in GitHub Codespaces

GitHub Codespaces gives you a cloud-based developer environment with Node.js available — this avoids installing Node.js locally.

1. Open this repository in GitHub and choose Code → Open with Codespaces → New codespace.
2. In the Codespace terminal, run the same commands as above to install and start the site or prototype.

For the design-history site (root):

```bash
npm install
npm start
```

For the prototypes:

```bash
cd prototypes
npm install
npm run dev
```

Tip: Codespaces exposes ports automatically; use the forwarded port URL it shows.

## Editing content and layout

- Content for the design history site lives in the `app/` folder. Templates and macros are in `app/_components/` and layouts in `app/_layouts/`.
- Prototype views live inside `prototypes/app/views` (and assets in `prototypes/app/assets`).

Make small changes, then refresh your browser — the dev servers should pick up changes.

## Tests and linting

The root `package.json` includes a `test` script that runs `standard` (a JavaScript style checker). Run:

```bash
npm test
```

to check code style.

## Contributing

If you want to contribute:

1. Fork the repo on GitHub.
2. Create a feature branch locally.
3. Make changes and run the site or prototype to verify.
4. Commit and push, then open a pull request describing your changes.

Please include a short summary of why the change is needed and how to test it.

## Troubleshooting

- If you see errors about Node version, confirm your Node.js is 22+.
- If `npm install` fails, remove `node_modules` and try again, or remove lockfiles and retry.
- If the prototype `serve` script fails because of an unexpected character, use `npm run dev` or `npm run start` instead.

## Where things live

- Root design history site: content and templates in `app/`.
- Prototypes: `prototypes/app/`, `prototypes/assets/`, and the Prototype Kit setup in `prototypes/`.

