import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  onActivate as initiateAnimationAction,
  playKioskAnimation as playKioskAnimationAction,
} from '../../../../modules/animation/actions';
import { selectDate as selectDateAction } from '../../../../modules/date/actions';

function KioskAnimations({ ui }) {
  const dispatch = useDispatch();
  const initiateAnimation = () => { dispatch(initiateAnimationAction()); };
  const playKioskAnimation = (startDate, endDate) => { dispatch(playKioskAnimationAction(startDate, endDate)); };
  const selectDate = (date) => { dispatch(selectDateAction(date)); };

  const {
    selectedDate,
    isAnimationPlaying,
    isKioskModeActive,
    eic,
    map,
    eicAnimationMode,
    eicMeasurementComplete,
  } = useSelector((state) => ({
    selectedDate: state.date.selected,
    isAnimationPlaying: state.animation.isPlaying,
    isKioskModeActive: state.ui.isKioskModeActive,
    eic: state.ui.eic,
    eicAnimationMode: state.ui.eic === 'sa' || state.ui.eic === 'da',
    map: state.map,
    eicMeasurementComplete: state.ui.eicMeasurementComplete,
  }));

  const [subdailyAnimationDateUpdated, setSubdailyAnimationDateUpdated] = useState(false);

  useEffect(() => {
    if (!ui.selected || !isKioskModeActive || !eicMeasurementComplete || isAnimationPlaying || !eicAnimationMode) return;
    checkAnimationSettings();
  }, [map, eicMeasurementComplete]);

  const subdailyPlayCheck = eic === 'sa' && subdailyAnimationDateUpdated && !isAnimationPlaying;
  const dailyPlayCheck = eic === 'da' && !isAnimationPlaying;

  // if subdaily animation check that date moved back one day otherwise check if animation should play
  const checkAnimationSettings = () => {
    if (!ui.selected.frameState_) return;
    if (eic === 'sa' && !subdailyAnimationDateUpdated) {
      const prevDayDate = new Date(selectedDate);
      prevDayDate.setDate(prevDayDate.getDate() - 1);
      selectDate(prevDayDate);
      setSubdailyAnimationDateUpdated(true);
    } else if (subdailyPlayCheck || dailyPlayCheck) {
      handleAnimationSettings();
    }
  };

  // zero dates for subdaily times
  const zeroDates = (start, end) => {
    const startDateZeroed = new Date(start);
    const endDateZeroed = new Date(end);

    // for subdaily, zero start and end dates to UTC HH:MM:00:00
    const startMinutes = startDateZeroed.getMinutes();
    const endMinutes = endDateZeroed.getMinutes();
    startDateZeroed.setUTCMinutes(Math.floor(startMinutes / 10) * 10);
    startDateZeroed.setUTCSeconds(0);
    startDateZeroed.setUTCMilliseconds(0);
    endDateZeroed.setUTCMinutes(Math.floor(endMinutes / 10) * 10);
    endDateZeroed.setUTCSeconds(0);
    endDateZeroed.setUTCMilliseconds(0);

    return {
      startDate: startDateZeroed,
      endDate: endDateZeroed,
    };
  };

  // start time to determine animation duration
  const updateStartTime = (dateString) => {
    const date = new Date(dateString);
    if (eic === 'sa') {
      // Subtract 6 hours (6 * 60 * 60 * 1000 milliseconds) for subdaily animations
      date.setTime(date.getTime() - 6 * 60 * 60 * 1000);
    } else {
      // Subtract 1 month for daily animations
      date.setMonth(date.getMonth() - 1);
    }
    return date.toString();
  };

  // Invoked after tileError check is complete, this will trigger the animation availability check
  const handleAnimationSettings = () => {
    const start = updateStartTime(selectedDate);
    const end = selectedDate;
    const { startDate, endDate } = zeroDates(start, end);

    initiateAnimation();
    playKioskAnimation(startDate, endDate);
  };

  return null;
}

KioskAnimations.propTypes = {
  ui: PropTypes.object,
};

export default KioskAnimations;
