import { each as lodashEach } from 'lodash';
import TileLayer from 'ol/layer/Tile';
import { transformExtent } from 'ol/proj';

// removes all of the layers from the openlayers map object
export const clearLayers = function(ui) {
  const activeLayersUI = ui.selected
    .getLayers()
    .getArray()
    .slice(0);
  lodashEach(activeLayersUI, (mapLayer) => {
    ui.selected.removeLayer(mapLayer);
  });
  ui.cache.clear();
};

/**
 * Counts the number of tiles that are loaded and expected to be loaded
 * @param {object} ui
 * @returns {object}
 */
export const countTiles = (ui) => {
  const map = ui.selected;
  const view = map.getView();
  const layerGroup = map.getLayers().item(0);
  const layers = layerGroup.getLayers().getArray();
  const numberOfLayers = layers.length;

  let totalExpectedTileCount = 0;
  let totalLoadedTileCount = 0;

  layers.forEach((layer) => {
    if (layer instanceof TileLayer) {
      const source = layer.getSource();
      const size = map.getSize();
      const extent = view.calculateExtent(size);
      const zoom = view.getZoom();
      const sourceProjection = source.getProjection() || view.getProjection();
      const transformedExtent = transformExtent(extent, view.getProjection(), sourceProjection);
      const tileGrid = source.getTileGridForProjection(sourceProjection);
      const resolution = view.getResolutionForZoom(zoom);
      const currentZ = tileGrid.getZForResolution(resolution);

      let expectedTileCount = 0;
      let loadedTileCount = 0;

      const tileCoordFunction = (tileCoord) => {
        expectedTileCount += 1;
        const tile = source.getTile(tileCoord[0], tileCoord[1], tileCoord[2], 1, sourceProjection);
        if (tile.getState() === 2) loadedTileCount += 1;
      };

      tileGrid.forEachTileCoord(transformedExtent, currentZ, tileCoordFunction);

      totalExpectedTileCount += expectedTileCount;
      totalLoadedTileCount += loadedTileCount;
    }
  });

  return {
    totalExpectedTileCount: totalExpectedTileCount / numberOfLayers,
    totalLoadedTileCount,
  };
};

/**
 * Formats redux date to match timezone of tile request urls.
 * Used in formatDate() when there are subdaily tiles
 * @param {string} timestamp
 * @returns {string}
 */
export function convertTimestamp(timestamp) {
  const date = new Date(timestamp);
  // add 4 hours to the time
  date.setHours(date.getHours() + 4);
  // set the seconds to 0
  date.setSeconds(0);
  // round down the minutes to the nearest multiple of 10
  const roundedMinutes = Math.floor(date.getMinutes() / 10) * 10;
  // format the updated date back to a string
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(roundedMinutes).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

/**
 * Formats redux date to match format of dates from tile request url
 * @param {string} dateString
 * @param {boolean} hasSubdailyLayers
 * @returns {string}
 */
export function formatDate(dateString, hasSubdailyLayers) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (hasSubdailyLayers) {
    const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    const adjustedTimezone = convertTimestamp(timestamp);
    return adjustedTimezone;
  }

  return `${year}-${month}-${day}T00:00:00`;
}

/**
 * Returns date string for 1 week before a given date string
 * @param {string} date
 * @returns {string}
 */
export function weekAgo(date) {
  const inputDate = new Date(date);
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const earlierDate = new Date(inputDate.getTime() - oneWeekInMilliseconds);
  const earlierDateString = earlierDate.toString();
  return earlierDateString;
}

/**
 * Returns date string for 3 hours before a given date string
 * @param {string} date
 * @returns {string}
 */
export function threeHoursAgo(date) {
  const inputDate = new Date(date);
  const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;
  const earlierDate = new Date(inputDate.getTime() - threeHoursInMilliseconds);
  const earlierDateString = earlierDate.toString();
  return earlierDateString;
}

/**
 * Compares two dates and returns true if the selected date is younger than the last date to check
 * Used as a safeguard to prevent automatically stepping back farther than 1 week in kiosk mode
 * @param {string} lastDateToCheck
 * @param {string} selectedDate
 * @returns {boolean}
 */
export function compareDailyDates(lastDateToCheck, selectedDate) {
  const lastDate = new Date(lastDateToCheck);
  const selected = new Date(selectedDate);
  lastDate.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected > lastDate;
}

/**
 * Compares two dates and returns true if ONLY the hour value in selectedDate is greater than 3 hours ahead of lastDateToCheck
 * Used as a safeguard to prevent automatically stepping back farther than 3 hours for subdaily tiles in kiosk mode
 * @param {string} lastDateToCheck
 * @param {string} selectedDate
 * @returns {boolean}
 */
export function compareSubdailyDates(lastDateToCheck, selectedDate) {
  const lastDate = new Date(lastDateToCheck);
  const selected = new Date(selectedDate);
  const lastDateHour = lastDate.getHours();
  const selectedDateHour = selected.getHours();
  // Calculate the hour difference, considering the 24-hour wraparound
  const hourDifference = (selectedDateHour - lastDateHour + 24) % 24;
  // Check if the hour value in selectedDate is exactly 3 hours behind lastDateToCheck
  if (hourDifference > 3) {
    return false;
  }
  return true;
}