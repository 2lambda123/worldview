import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearErrorTiles as clearErrorTilesAction,
  toggleStaticMap,
} from '../../../modules/ui/actions';
import {
  selectDate as selectDateAction,
  selectInterval as selectIntervalAction,
} from '../../../modules/date/actions';
import { getNextDateTime } from '../../../modules/date/util';
import {
  subdailyLayersActive,
  getActiveLayers,
  getActiveLayersMap,
} from '../../../modules/layers/selectors';
// import { removeGroup as removeGroupActtion } from '../../../modules/layers/actions';
import { clearLayers } from '../util/util';

// updating timezone for subdaily times
function convertTimestamp(timestamp) {
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

// formats redux date to match tile date formats
function formatDate(dateString, hasSubdailyLayers) {
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

// gets a week ago from real time date
function weekAgo(realTimeDate) {
  const inputDate = new Date(realTimeDate);
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const earlierDate = new Date(inputDate.getTime() - oneWeekInMilliseconds);
  const earlierDateString = earlierDate.toString();
  return earlierDateString;
}

// gets three hours ago frm real time date
function threeHoursAgo(realTimeDate) {
  const inputDate = new Date(realTimeDate);
  const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;
  const earlierDate = new Date(inputDate.getTime() - threeHoursInMilliseconds);
  const earlierDateString = earlierDate.toString();
  return earlierDateString;
}

// safe gaurd agaisnt stepping back too far, we only want to go back 7 days for daily layers
function compareDailyDates(lastDateToCheck, selectedDate) {
  const lastDate = new Date(lastDateToCheck);
  const selected = new Date(selectedDate);
  lastDate.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected > lastDate;
}

// safe gaurd agaisnt stepping back too far, we only want to go back 3 hours for subdaily
// only comparing hours since the daily layers are checked & moved first
function compareSubdailyDates(lastDateToCheck, selectedDate) {
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

function TileErrorHandler({ action, ui }) {
  const dispatch = useDispatch();
  const clearErrorTiles = () => { dispatch(clearErrorTilesAction()); };
  const selectDate = (date) => { dispatch(selectDateAction(date)); };
  const selectInterval = (delta, timeScale, customSelected) => { dispatch(selectIntervalAction(delta, timeScale, customSelected)); };
  const toggleStaticMapAction = (isActive) => { dispatch(toggleStaticMap(isActive)); };

  const {
    isKioskModeActive, errorTiles, selectedDate, date, compare, isLoading, realTimeDate,
  } = useSelector((state) => ({
    isKioskModeActive: state.ui.isKioskModeActive,
    errorTiles: state.ui.errorTiles,
    selectedDate: state.date.selected,
    date: state.date,
    compare: state.compare,
    isLoading: state.loading.isLoading,
    realTimeDate: state.date.appNow,
  }));
  const { activeString } = compare;
  const hasSubdailyLayers = useSelector((state) => subdailyLayersActive(state));
  const layersMap = useSelector((state) => getActiveLayersMap(state));
  const activeLayers = useSelector((state) => getActiveLayers(state, activeString));

  const { dailyTiles, subdailyTiles } = errorTiles;

  // 7 days ago from real time date
  const lastDateToCheck = weekAgo(realTimeDate);
  const lastTimeToCheck = threeHoursAgo(realTimeDate);

  // true === safe (date is younger than last date to check)
  const dailySafeguardCheck = compareDailyDates(lastDateToCheck, selectedDate);
  const hourlySafeguardCheck = compareSubdailyDates(lastTimeToCheck, selectedDate);

  const errorTileCheck = dailyTiles.length || subdailyTiles.length;

  useEffect(() => {
    if (isKioskModeActive && errorTileCheck && dailySafeguardCheck && !isLoading) {
      handleTileErrors();
      // add isActive for static map to check if it is false
    } else if (isKioskModeActive && errorTileCheck && !dailySafeguardCheck && !isLoading) {
      handleStaticMap();
    }
  }, [action]);

  const handleStaticMap = () => {
    clearLayers(ui);
    toggleStaticMapAction(true);

    console.log('layersMap', layersMap);
    console.log('activeLayers', activeLayers);

    // const layersForGroup = layers.map((id) => activeLayersMap[id]);
    // const groupLayerIds = layers.map(({ id }) => id);
    // console.log('layersForGroup', layersForGroup)
    // console.log('groupLayerIds', groupLayerIds)
  };

  const handleTimeChange = (tiles, isSubdaily) => {
    const currentDate = formatDate(selectedDate, isSubdaily);
    const errorTilesOnCurrentDate = tiles.filter((tile) => currentDate === tile.date).length;
    if (errorTilesOnCurrentDate) {
      const state = { date, compare };
      if (hasSubdailyLayers && !isSubdaily) selectInterval(1, 3, false);
      const prevDate = getNextDateTime(state, '-1');
      const prevDateObj = new Date(prevDate);
      clearErrorTiles();
      selectDate(prevDateObj);
    }
  };

  const handleTileErrors = () => {
    if (dailyTiles.length) handleTimeChange(dailyTiles, false);
    if (subdailyTiles.length && hourlySafeguardCheck) handleTimeChange(subdailyTiles, true);
    clearErrorTiles();
  };

  return null;
}

export default TileErrorHandler;

TileErrorHandler.propTypes = {
  action: PropTypes.object,
};
