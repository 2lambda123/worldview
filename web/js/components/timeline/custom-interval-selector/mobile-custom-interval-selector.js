import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DeltaInput from './delta-input';
import IntervalSelect from './interval-select';
import {
  TIME_SCALE_FROM_NUMBER,
  TIME_SCALE_TO_NUMBER,
} from '../../../modules/date/constants';
import {
  selectInterval as selectIntervalAction,
  changeCustomInterval as changeCustomIntervalAction,
} from '../../../modules/date/actions';

const MobileCustomIntervalSelector = (props) => {
  const {
    changeCustomInterval,
    customInterval,
    customSelected,
    hasSubdailyLayers,
    interval,
    selectInterval,
    customDelta,
  } = props;

  const changeDelta = (value) => {
    if (value >= 0 && value <= 1000) {
      changeCustomInterval(value, customInterval);
    }
  }

  const changeZoomLevel = (zoomLevel) => {
    changeCustomInterval(customDelta, TIME_SCALE_TO_NUMBER[zoomLevel]);
  }

  return (
    <div>
        <h3 className="custom-interval-widget-header">Custom Interval Selector</h3>
        <div className="custom-interval-widget-controls-container">
          <DeltaInput
            deltaValue={customDelta}
            changeDelta={changeDelta}
          />
          <IntervalSelect
            hasSubdailyLayers={hasSubdailyLayers}
            zoomLevel={TIME_SCALE_FROM_NUMBER[customInterval]}
            changeZoomLevel={changeZoomLevel}
          />
        </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  changeCustomInterval: (delta, timeScale) => {
    dispatch(changeCustomIntervalAction(delta, timeScale));
  },
  selectInterval: (delta, timeScale, customSelected) => {
    dispatch(selectIntervalAction(delta, timeScale, customSelected));
  },
});

const mapStateToProps = (state) => {
  const { date } = state;
  const {
    interval, customInterval, customDelta, customSelected,
  } = date;
  return {
    customDelta: customDelta || 1,
    customInterval: customInterval || interval,
    customSelected,
    interval,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MobileCustomIntervalSelector);

MobileCustomIntervalSelector.propTypes = {
  changeCustomInterval: PropTypes.func,
  closeModal: PropTypes.func,
  customDelta: PropTypes.number,
  customInterval: PropTypes.number,
  customSelected: PropTypes.bool,
  hasSubdailyLayers: PropTypes.bool,
  interval: PropTypes.number,
  selectInterval: PropTypes.func,
  modalOpen: PropTypes.bool,
};