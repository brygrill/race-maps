import turfHelpers from '@turf/helpers';
import turflineChunk from '@turf/line-chunk';
import turfAlong from '@turf/along';

const genMileMarkers = bc50k => {
  const bcLine = turfHelpers.lineString(bc50k.features[0].geometry.coordinates);
  const chunk = turflineChunk(bcLine, 1, 'miles');
  const markers = {
    type: 'FeatureCollection',
    features: [],
  };
  chunk.features.map((item, index) => {
    const chunkLine = turfHelpers.lineString(item.geometry.coordinates);
    const mile = turfAlong(chunkLine, 1, 'miles');

    mile.properties.mark = index + 1;
    markers.features.push(mile);
    return mile;
  });
  return markers;
};

export default genMileMarkers;
