import { supportedTypes } from './entityTitle.js'

function docType (type) {
  const types = Object.fromEntries(
    Object.entries(supportedTypes).map(([key, value]) => [key, value.singular])
  )

  if (Object.prototype.hasOwnProperty.call(types, type)) {
    return types[type]
  } else {
    return type
  }
}

export default docType
