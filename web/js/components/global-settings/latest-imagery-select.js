import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  UncontrolledTooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import Checkbox from '../util/checkbox';
import { updateLatestImageryAndTime as updateImageryTimeAction } from '../../modules/settings/actions';

const menuOptions = [
  {
    title: '5 sec',
    value: 5000,
  },
  {
    title: '10 sec',
    value: 10000,
  },
  {
    title: '15 sec',
    value: 15000,
  },
  {
    title: '5 min',
    value: 5 * 60000,
  },
  {
    title: '10 min',
    value: 10 * 60000,
  },
  {
    title: '15 min',
    value: 15 * 60000,
  },
  {
    title: '30 min',
    value: 30 * 60000,
  },
  {
    title: '60 min',
    value: 60 * 60000,
  },
];

function LatestImagerySelect () {
  const { updateLatestImageryAndTime } = useSelector((state) => ({
    updateLatestImageryAndTime: state.settings.updateLatestImageryAndTime,
  }));
  const { isActive, title, interval } = updateLatestImageryAndTime;

  const dispatch = useDispatch();
  // updates bool val in settings state to indicate if setting is on/off
  const toggleLatestImageryAndTime = (payload) => { dispatch(updateImageryTimeAction(payload.isActive, payload.interval, payload.title)); };

  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = () => setMenuOpen(!menuOpen);

  const [selectedInterval, setSelectedInterval] = useState({ title, value: interval });

  const handleMenuSelect = (option) => {
    setSelectedInterval(option);
    // when menu options change we need to update redux state
    const payload = { isActive, interval: option.value, title: option.title };
    toggleLatestImageryAndTime(payload);
  };

  // on checkbox click update setting state
  const handleCheckboxClick = () => {
    let payload;
    // if we are turning off setting, keep the same title/interval
    if (isActive) {
      payload = { isActive: false, interval, title };
    // else if we are turning on we will use selected options
    } else {
      // this is title from menu options array... kind of confusing
      const { value, title } = selectedInterval;
      payload = { isActive: true, interval: value, title };
    }
    toggleLatestImageryAndTime(payload);
  };

  const headerText = 'Automatically Update Latest Imagery & Time  ';
  const tooltipText = 'Automatically check and update on screen imagery and time to latest available. Updated imagery may not always be availabe at each interval.';

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
      <div id="latest-imagery-options-container">
        <Checkbox
          id="latest-imagery-checkbox"
          checked={isActive}
          onCheck={handleCheckboxClick}
        />
        <Dropdown
          id="latest-imagery-menu-container"
          isOpen={menuOpen}
          toggle={toggle}
          disabled={!isActive}
        >
          <DropdownToggle
            id="latest-imagery-menu-button"
            className={!isActive ? 'disabled' : ''}
            caret
          >
            {title}
          </DropdownToggle>
          <DropdownMenu
            id="latest-imagery-menu"
            style={{ transform: 'translate3d(-30px, 0px, 0px)' }}
          >
            <DropdownItem id="latest-imagery-menu-item-header" header>Select Interval</DropdownItem>
            <DropdownItem divider />
            {menuOptions.map((option) => (
              <DropdownItem
                className="latest-imagery-menu-items"
                key={option.title}
                onClick={() => handleMenuSelect(option)}
              >
                {option.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

export default LatestImagerySelect;
