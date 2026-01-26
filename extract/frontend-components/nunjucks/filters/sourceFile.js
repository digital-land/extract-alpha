function sourceFile (url) {
  return url ? url.replace('://localstack', '://localhost') : url
}

export default sourceFile
