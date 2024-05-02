'use strict';

/* Turf.js to help calculate if the position is inside on or many polygons.
   Use the individual turf packages to keep size down */
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const turfHelpers = require('@turf/helpers');

function parseGeoJSONPolygons(geojsonString) {
  const geojson = JSON.parse(geojsonString);

  let polygons = [];

  // Check the type of GeoJSON data
  if (geojson.type === 'Polygon') {
    polygons.push(turfHelpers.polygon(geojson.coordinates));
  } else if (geojson.type === 'MultiPolygon') {
    polygons = geojson.coordinates.map(coords => turfHelpers.polygon(coords));
  } else if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        polygons.push(turfHelpers.polygon(feature.geometry.coordinates));
      } else if (feature.geometry.type === 'MultiPolygon') {
        polygons.push(...feature.geometry.coordinates.map(coords => turfHelpers.polygon(coords)));
      }
    });
  } else if (geojson.type === 'Feature') {
    if (geojson.geometry.type === 'Polygon') {
      polygons.push(turfHelpers.polygon(geojson.geometry.coordinates));
    } else if (geojson.geometry.type === 'MultiPolygon') {
      polygons = geojson.geometry.coordinates.map(coords => turfHelpers.polygon(coords));
    }
  }

  return polygons;
}

function isPointInsideAnyPolygon(point, polygons) {
  const turfPoint = turfHelpers.point(point);
  return polygons.some(polygon => booleanPointInPolygon(turfPoint, polygon));
}

function checkPointInPolygons(point, geojsonString) {
  const polygons = parseGeoJSONPolygons(geojsonString);
  return isPointInsideAnyPolygon(point, polygons);
}

module.exports = { checkPointInPolygons }