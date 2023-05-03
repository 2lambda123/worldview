import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearErrorTiles as clearErrorTilesAction,
  toggleStaticMap as toggleStaticMapAction,
} from '../../../../modules/ui/actions';
import {
  selectDate as selectDateAction,
  selectInterval as selectIntervalAction,
} from '../../../../modules/date/actions';
import { getNextDateTime } from '../../../../modules/date/util';
import {
  subdailyLayersActive,
  getActiveLayers,
} from '../../../../modules/layers/selectors';
import { toggleGroupVisibility as toggleGroupVisiblityAction } from '../../../../modules/layers/actions';
import {
  // countTiles,
  formatDate,
  weekAgo,
  threeHoursAgo,
  compareDailyDates,
  compareSubdailyDates,
  formatSelectedDate,
} from '../../../util/util';

function TileErrorHandler({ action, ui }) {
  const dispatch = useDispatch();
  const clearErrorTiles = () => { dispatch(clearErrorTilesAction()); };
  const selectDate = (date) => { dispatch(selectDateAction(date)); };
  const selectInterval = (delta, timeScale, customSelected) => { dispatch(selectIntervalAction(delta, timeScale, customSelected)); };
  const toggleStaticMap = (isActive) => { dispatch(toggleStaticMapAction(isActive)); };
  const toggleGroupVisibility = (ids, visible) => { dispatch(toggleGroupVisiblityAction(ids, visible)); };

  const {
    // autoplayAnimation,
    // isAnimationPlaying,
    displayStaticMap,
    isKioskModeActive,
    errorTiles,
    selectedDate,
    date,
    compare,
    isLoading,
    realTimeDate,
  } = useSelector((state) => ({
    autoplayAnimation: state.animation.autoplay,
    displayStaticMap: state.ui.displayStaticMap,
    isAnimationPlaying: state.animation.isPlaying,
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
  const activeLayerIds = useSelector((state) => getActiveLayers(state, activeString).map((layer) => layer.id));

  const {
    dailyTiles, subdailyTiles, blankTiles, kioskTileCount,
  } = errorTiles;

  const lastDateToCheck = weekAgo(realTimeDate);
  const lastTimeToCheck = threeHoursAgo(realTimeDate);

  const dailySafeguardCheck = compareDailyDates(lastDateToCheck, selectedDate);
  const hourlySafeguardCheck = compareSubdailyDates(lastTimeToCheck, selectedDate);

  const errorTileCheck = dailyTiles.length || subdailyTiles.length;
  const blankTileCheck = blankTiles.length;

  useEffect(() => {
    if (isKioskModeActive && errorTileCheck && dailySafeguardCheck && !isLoading) {
      handleTileErrors();
    } else if (isKioskModeActive && errorTileCheck && (!dailySafeguardCheck || !hourlySafeguardCheck) && !isLoading) {
      handleStaticMap();
    } else if (isKioskModeActive && blankTileCheck && dailySafeguardCheck && !isLoading) {
      handleTimeChangeForBlankTiles();
    }
  }, [action]);

  const handleStaticMap = () => {
    toggleStaticMap(true);
    toggleGroupVisibility(activeLayerIds, false);
  };

  const handleTimeChangeForBlankTiles = () => {
    // console.log('kioskTileCount', kioskTileCount, 'blankTilesCount', blankTiles.length, 'percentage: ', (blankTiles.length / kioskTileCount) * 100, '%', 'firstDate', blankTiles[0].date, 'lastDate', blankTiles[blankTiles.length -1].date)
    const blankTilesOnCurentDate = blankTiles.filter((tile) => tile.date === formatSelectedDate(selectedDate)).length;
    if (!blankTilesOnCurentDate) return clearErrorTiles();
    const blankTilesPercentage = (blankTiles.length / kioskTileCount) * 100;
    if (blankTilesPercentage >= 50) {
      const state = { date, compare };
      const prevDate = getNextDateTime(state, '-1');
      const prevDateObj = new Date(prevDate);
      selectDate(prevDateObj);
    }
    clearErrorTiles();
  };

  const handleTimeChangeForErrors = (tiles, isSubdaily) => {
    const currentDate = formatDate(selectedDate, isSubdaily);
    const errorTilesOnCurrentDate = tiles.filter((tile) => currentDate === tile.date).length;
    // console.log('errorTilesOnCurrentDate', errorTilesOnCurrentDate, 'currentDate', currentDate)
    if (errorTilesOnCurrentDate) {
      const state = { date, compare };
      if (hasSubdailyLayers && !isSubdaily) selectInterval(1, 3, false);
      const prevDate = getNextDateTime(state, '-1');
      const prevDateObj = new Date(prevDate);
      selectDate(prevDateObj);
    }
    clearErrorTiles();
    // handleReadyForAnimation();
    if (!hourlySafeguardCheck || !dailySafeguardCheck) return handleStaticMap();
  };

  const handleTileErrors = () => {
    if (dailyTiles.length) return handleTimeChangeForErrors(dailyTiles, false);
    if (subdailyTiles.length && hourlySafeguardCheck) return handleTimeChangeForErrors(subdailyTiles, true);
    if ((!hourlySafeguardCheck || !dailySafeguardCheck) && !displayStaticMap) return handleStaticMap();
  };

  // dont call this unless autoplay animation is true
  // const handleReadyForAnimation = () => {
  //   // if map is loaded AND not turned on yet AND autoplayAnimation is on AND kiosk mode is on AND animation is not playing AND static map is not displayed AND error tiles and blank tiles are empty
  //   const animationCheck = ui.selected  && autoplayAnimation && isKioskModeActive && !isAnimationPlaying && !displayStaticMap && !errorTileCheck;
  //   if (animationCheck) {
  //     const { totalExpectedTileCount, totalLoadedTileCount } = countTiles(ui);
  //     const percentageOfLoadedTiles = (totalLoadedTileCount / totalExpectedTileCount) * 100;

  //     if (percentageOfLoadedTiles >= 75) {

  //     }
  //   }
  // };

  return null;
}

export default TileErrorHandler;

TileErrorHandler.propTypes = {
  action: PropTypes.object,
  ui: PropTypes.object,
};
