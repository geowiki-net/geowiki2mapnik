const OverpassFrontend = require('overpass-frontend')
const filter2mapnik = require('./filter2mapnik')

module.exports = function compileQueries (layers, fields) {
  const layerQs = layers.map((layer, i) => {
    const filter = new OverpassFrontend.Filter(layer.query)
    const query = filter2mapnik(filter.sets._)

    console.log(query)
    return '(select Test_layer' + i + '(type, osm_id, hstore_to_json(tags)) exprs, way from (' + query + ') t)'
  })

  const selects = Object.entries(fields).map(([field, values]) => {
    if (values.length > 1 || values.includes(undefined)) {
      const escField = field.replace('-', '_')
      return `exprs->>'${field}' "${escField}"`
    }

    return null
  }).filter(v => v).join(', ')

  let result = 'select ' + selects + ', way from (' + layerQs.join(' union all ') + ') t'
  result = result.replace(/</g, '&lt;')
  result = result.replace(/>/g, '&gt;')
  return result
}
