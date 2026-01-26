export const supportedTypes = {
  article4direction: {
    singular: 'Article 4 Direction',
    plural: 'Article 4 Directions',
    entity: 'article-4-direction'
  },
  conservationarea: {
    singular: 'Conservation Area',
    plural: 'Conservation Areas',
    entity: 'conservation-area'
  },
  treepreservationorder: {
    singular: 'Tree Preservation Order',
    plural: 'Tree Preservation Orders',
    entity: 'tree-preservation-order'
  },

  article4directionarea: {
    singular: 'Article 4 Direction Area',
    plural: 'Article 4 Direction Areas',
    entity: 'article-4-direction-area'
  },
  tree: { singular: 'Tree', plural: 'Trees', entity: 'tree' },
  treepreservationzone: {
    singular: 'Tree Preservation Zone',
    plural: 'Tree Preservation Zones',
    entity: 'tree-preservation-zone'
  }
}

function entityTitle (type) {
  if (Object.prototype.hasOwnProperty.call(supportedTypes, type)) {
    return supportedTypes[type]
  } else {
    return type
  }
}

export default entityTitle
