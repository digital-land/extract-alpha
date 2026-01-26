
const config = {
  serviceName: 'Extract planning data',
  serviceNameShort: 'Extract',
  isDebug:
    process.env.ENVIRONMENT === 'local' ||
    process.env.NODE_ENV === 'development',
  basePath: process.env.BASE_PATH || '/',
  publicPath: process.env.PUBLIC_PATH || '/public',
  templatePaths: (() => {
    const paths = ['./src/views/', './src', './node_modules/govuk-frontend/dist/']
    return paths
  })(),
  feedbackUrl: process.env.FEEDBACK_URL || 'https://forms.gle/ga424FcF52k3Lot49',
  feedbackRejectionUrl: process.env.FEEDBACK_REJECTION_URL || 'https://forms.gle/LjbcSdgwfYDng1uU7',
  allowEdits: process.env.FEATURE_FLAG_ALLOW_EDITS === 'true' || false
}


// Selectively export only the desired config properties
export const isDebug = config.isDebug
export const basePath = config.basePath
export const publicPath = config.publicPath
export const serviceName = config.serviceName
export const serviceNameShort = config.serviceNameShort
export const feedbackUrl = config.feedbackUrl
export const feedbackRejectionUrl = config.feedbackRejectionUrl
export const allowEdits = config.allowEdits
export const govukRebrand = true

// You can also export other globals if needed
export const exampleGlobal = 'This is an example global variable'

export const feedbackHtml = feedbackUrl ? `This is a prototype - your <a class="govuk-link" href="${feedbackUrl}">feedback</a> will help us to improve it.` : 'This is a prototype.'
export const successMessages = []
export const errorMessages = []
