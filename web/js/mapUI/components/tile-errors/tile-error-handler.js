import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { clearErrorTiles as clearErrorTilesAction } from '../../../modules/ui/actions';
import { selectDate as selectDateAction } from '../../../modules/date/actions';
import { getNextDateTime } from '../../../modules/date/util';
import { subdailyLayersActive } from '../../../modules/layers/selectors';

// updating timezone for subdaily times
// do we also need to do this for daily dates since we are 4 hours behind??
function convertTimestamp(timestamp) {
  const date = new Date(timestamp);
  // Add 4 hours to the time
  date.setHours(date.getHours() + 4);
  // Set the seconds to 0
  date.setSeconds(0);
  // Round down the minutes to the nearest multiple of 10
  const roundedMinutes = Math.floor(date.getMinutes() / 10) * 10;
  // Format the updated date back to a string
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(roundedMinutes).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}


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
  return `${year}-${month}-${day}`;
}

function TileErrorHandler({ action }) {
  const dispatch = useDispatch();
  const clearErrorTiles = () => { dispatch(clearErrorTilesAction()); };
  const selectDate = (date) => { dispatch(selectDateAction(date)); };

  const {
    isKioskModeActive, errorTiles, selectedDate, date, compare, isLoading,
  } = useSelector((state) => ({
    isKioskModeActive: state.ui.isKioskModeActive,
    errorTiles: state.ui.errorTiles,
    selectedDate: state.date.selected,
    date: state.date,
    compare: state.compare,
    isLoading: state.loading.isLoading,
  }));

  const hasSubdailyLayers = useSelector((state) => subdailyLayersActive(state));

  useEffect(() => {
    if (isKioskModeActive && errorTiles.length && !isLoading) {
      if (hasSubdailyLayers) {
        handleErrorTilesSubdaily();
      } else {
        handleErrorTiles();
      }
    }
  }, [action]);

  const handleErrorTiles = () => {
    const currentDate = formatDate(selectedDate, false);
    const errorTilesOnCurrentDate = errorTiles.filter((tile) => currentDate === tile.date).length;
    console.log('There are ', errorTilesOnCurrentDate, ' on ', selectedDate);
    if (errorTilesOnCurrentDate > 1) {
      const state = { date, compare };
      const prevDate = getNextDateTime(state, '-1');
      const prevDateObj = new Date(prevDate);
      clearErrorTiles();
      selectDate(prevDateObj);
    } else {
      clearErrorTiles();
    }
  };

  // how are we going to do this when there are daily & subdaily layers?
  // can we add property in layerBuilder to the redux object that specifies if layer is daily/subdaily?
  const handleErrorTilesSubdaily = () => {
    const currentDate = formatDate(selectedDate, true);

    const errorTilesOnCurrentDate = errorTiles.filter((tile) => currentDate === tile.date).length;
    console.log('There are ', errorTilesOnCurrentDate, ' on ', selectedDate);
    if (errorTilesOnCurrentDate > 1) {
      console.log('redux date', currentDate);
      console.log('errortileDate ', errorTiles[0].date);
      const state = { date, compare };
      const prevDate = getNextDateTime(state, '-1');
      const prevDateObj = new Date(prevDate);
      clearErrorTiles();
      selectDate(prevDateObj);
    } else {
      clearErrorTiles();
    }
  };

  return null;
}

export default TileErrorHandler;

TileErrorHandler.propTypes = {
  action: PropTypes.object,
};