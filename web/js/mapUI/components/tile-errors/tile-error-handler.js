import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { clearErrorTiles as clearErrorTilesAction } from '../../../modules/ui/actions';
import { selectDate as selectDateAction } from '../../../modules/date/actions';
import { getNextDateTime } from '../../../modules/date/util';

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

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

  useEffect(() => {
    if (isKioskModeActive && errorTiles.length && !isLoading) {
      handleErrorTiles();
    }
  }, [action]);

  const handleErrorTiles = () => {
    const currentDate = formatDate(selectedDate);
    const errorTilesOnCurrentDate = errorTiles.filter((tile) => currentDate === tile.date).length;
    if (errorTilesOnCurrentDate > 4) {
      // console.log('There are ', errorTilesOnCurrentDate, ' on ', selectedDate)
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
