import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  UncontrolledTooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import Checkbox from '../util/checkbox'
import { updateLatestImageryAndTime as updateImageryTimeAction } from '../../modules/settings/actions'
import { triggerTodayButton as triggerUpdateAction } from '../../modules/date/actions'

function LatestImagerySelect () {
  // ===================== REDUX ==================================
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
  // ===================== END REDUX ==================================

  // ==================== MENU LOGIC =================================
  const menuOptions = [
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
    }
  ]

  const [menuOpen, setMenuOpen] = useState(false)
  const toggle = () => setMenuOpen(!menuOpen)

  const [selectedInterval, setSelectedInterval] = useState(menuOptions[0])

  const handleMenuSelect = (option) => {
    setSelectedInterval(option)
  }
  // ==================== END MENU LOGIC =================================

  // ==================== TIMER LOGIC ================================
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
  // ==================== END TIMER LOGIC ================================


  const headerText = 'Automatically Update Latest Imagery & Time  '
  const tooltipText = 'Automatically check and update on screen imagery and time to latest available. Updated imagery may not always be availabe at each interval.'
  const intervalTitle = selectedInterval.title
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
        checked={updateLatestImageryAndTime}
        onCheck={handleCheckboxClick}
        />
        <Dropdown
        id="latest-imagery-menu-container"
        isOpen={menuOpen}
        toggle={toggle}
        disabled={!updateLatestImageryAndTime}
        >
          <DropdownToggle
          id="latest-imagery-menu-button"
          className={!updateLatestImageryAndTime ? 'disabled' : ''}
          caret
          >
            {intervalTitle}
          </DropdownToggle>
          <DropdownMenu
          id="latest-imagery-menu"
          style={{ transform: 'translate3d(-30px, 0px, 0px)' }}
          >
            <DropdownItem header>Select Interval</DropdownItem>
            <DropdownItem divider/>
            {menuOptions.map((option) => (
                <DropdownItem
                key={option.title}
                onClick={() => handleMenuSelect(option)}
                >
                  {option.title}
                </DropdownItem>
              )
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}

export default LatestImagerySelect;
