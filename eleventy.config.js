import { govukEleventyPlugin } from '@x-govuk/govuk-eleventy-plugin'

export default function (eleventyConfig) {
  // Options to customise the appearance of your design history
  // https://x-govuk.github.io/govuk-eleventy-plugin/options/
  eleventyConfig.addPlugin(govukEleventyPlugin, {
    header: {
      productName: 'Extract planning data',
      search: {
        indexPath: '/search-index.json',
        sitemapPath: '/sitemap'
      },
      logotype: {
        text: '<img src="/digital-planning-logo_white.png" alt="Digital Planning logo" height="34" fill="currentcolor" class="govuk-header__logotype"><img src="/i-dot-ai-reverse.svg" alt="i.AI logo" height="30" fill="currentcolor" class="govuk-header__logotype"> '
      }
    },
    footer: {
      meta: {
        items: [
        {
          href: "/team/",
          text: "Team"
        },
        {
          href: "#",
          text: "Roadmap"
        },
        {
          href: "https://github.com/orgs/digital-land/projects/22/views/4",
          text: "Sprint board"
        }
      ]
  }
    },
    headingPermalinks: true,
    stylesheets: [
      '/assets/styles.css'
    ],
    templates: {
      searchIndex: true,
      tags: true,
      feed: {
        title: 'Weeknotes for Extract planning data',
        collection: 'weeknotes',
        url: 'https://digital-land.github.io/extract-alpha/',
        permalink: '/weeknotes/feed.xml'
      }
    },
    url:
      process.env.GITHUB_ACTIONS &&
      'https://digital-land.github.io/extract-alpha/'
  })

  // Make a flag available to templates indicating a production deploy on main
  // We consider production to be a GitHub Actions run on the `main` branch.
  const isProduction = Boolean(
    process.env.GITHUB_ACTIONS && process.env.GITHUB_REF === 'refs/heads/main'
  )
  eleventyConfig.addGlobalData('isProduction', isProduction)

  // Passthrough
  eleventyConfig.addPassthroughCopy({ './app/images': '.' })
  
  // Collections
  eleventyConfig.addCollection('design-history', collection => {
    return collection.getFilteredByGlob('app/posts/design-history/*.md')
  })

  eleventyConfig.addCollection('weeknotes', collection => {
    return collection.getFilteredByGlob('app/posts/weeknotes/*.md')
  })

  // Config
  return {
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'app',
      layouts: '_layouts',
      includes: '_components'
    },
    pathPrefix: process.env.GITHUB_ACTIONS && '/extract-alpha/'
  }
}
