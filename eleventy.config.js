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
      }
    },
    footer: {
      meta: {
        items: [
        {
          href: "#",
          text: "Team"
        },
        {
          href: "#",
          text: "Roadmap"
        },
        {
          href: "#",
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
      tags: true
    },
    url:
      process.env.GITHUB_ACTIONS &&
      'https://digital-land.github.io/extract-alpha/'
  })

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
