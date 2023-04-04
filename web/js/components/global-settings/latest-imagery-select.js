import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip } from 'reactstrap';
import Checkbox from '../util/checkbox'

function LatestImagerySelect (props) {

  const headerText = 'Automatically Update Latest Imagery & Time  '
  const tooltipText = 'Automatically check and update on screen imagery and time to latest available.'

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
      checked={false}
      />

    </div>
  )
}

export default LatestImagerySelect;