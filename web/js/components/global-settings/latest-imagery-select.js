import React, { useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import Checkbox from '../util/checkbox'
import { updateLatestImageryAndTime as updateImageryTimeAction } from '../../modules/settings/actions'
import { triggerTodayButton as triggerUpdateAction } from '../../modules/date/actions'

function LatestImagerySelect () {
  const dispatch = useDispatch();
  const toggleLatestImageryAndTime = (bool) => { dispatch(updateImageryTimeAction(bool))}
  const triggerUpdate = () => {
    console.log('dispatching action')
    dispatch(triggerUpdateAction())
  }

  const { updateLatestImageryAndTime } = useSelector((state) => ({
    updateLatestImageryAndTime: state.settings.updateLatestImageryAndTime
  }))

  const handleCheckboxClick = () => {
    toggleLatestImageryAndTime(!updateLatestImageryAndTime)
  }

  // Set up an interval to trigger the action
  const intervalId = useRef(null);

  useEffect(() => {
    if (updateLatestImageryAndTime) {
      console.log('setting new timer');
      intervalId.current = setInterval(() => {
        triggerUpdate();
      }, 5000); // 5 seconds in milliseconds
    }
  }, [updateLatestImageryAndTime, triggerUpdate]);

  // Clear the interval when the checkbox is unchecked
  useEffect(() => {

      if (!updateLatestImageryAndTime) {
        clearInterval(intervalId.current);
      }

  }, [updateLatestImageryAndTime]);

  const headerText = 'Automatically Update Latest Imagery & Time  '
  const tooltipText = 'Automatically check and update on screen imagery and time to latest available. Updated imagery may not always be availabe at each interval.'

  return (
    <div className="settings-component">
      <h3 className="wv-header">
        {headerText}
      <span><FontAwesomeIcon id="latest-imagery-info-icon" icon="info-circle" /></span>
      <UncontrolledTooltip
          id="coordinate-setting-tooltip"
          target="latest-imagery-info-icon"
          placement="right"
        >
          {tooltipText}
        </UncontrolledTooltip>
      </h3>
      <Checkbox
      id="latest-imagery-checkbox"
      checked={updateLatestImageryAndTime}
      onCheck={handleCheckboxClick}
      />
    </div>
  )
}

export default LatestImagerySelect;
