import React from 'react';
import PropTypes from 'prop-types';
import googleTagManager from 'googleTagManager';
import { connect } from 'react-redux';
import {
  UncontrolledTooltip,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isMobileOnly, isTablet } from 'react-device-detect';
import Button from '../../components/util/button';
import ModeSelection from '../../components/sidebar/mode-selection';
import { toggleCompareOnOff, changeMode } from '../../modules/compare/actions';
import SearchUiProvider from '../../components/layer/product-picker/search-ui-provider';
import { openCustomContent } from '../../modules/modal/actions';
import { stop as stopAnimationAction } from '../../modules/animation/actions';
import { getFilteredEvents } from '../../modules/natural-events/selectors';
import { LIMIT_EVENT_REQUEST_COUNT } from '../../modules/natural-events/constants';

const FooterContent = React.forwardRef((props, ref) => {
  const {
    isCompareActive,
    compareMode,
    isMobile,
    breakpoints,
    screenWidth,
    isPlaying,
    activeTab,
    changeCompareMode,
    addLayers,
    toggleCompare,
    compareFeature,
    eventsData,
  } = props;
  const compareBtnText = !isCompareActive
    ? `Start Comparison${isMobile ? ' Mode' : ''}`
    : `Exit Comparison${isMobile ? ' Mode' : ''}`;

  const isChartActive = false;
  const chartBtnText = !isChartActive
    ? `Start Chart${isMobile ? ' Mode' : ''}`
    : `Exit Chart${isMobile ? ' Mode' : ''}`;


  const onClickAddLayers = (e) => {
    e.stopPropagation();
    addLayers(isPlaying, isMobile, breakpoints, screenWidth);
    googleTagManager.pushEvent({ event: 'add_layers' });
  };

  const onClickToggleCompare = (e) => {
    e.stopPropagation();
    toggleCompare();
    googleTagManager.pushEvent({ event: 'comparison_mode' });
  };

  const renderLayersFooter = () => (
    <>
      <ModeSelection
        isActive={isCompareActive}
        isMobile={isMobile}
        selected={compareMode}
        onclick={changeCompareMode}
      />
      <div className="product-buttons">
        <Button
          id="layers-add"
          aria-label="Add layers"
          className="layers-add red"
          text="+ Add Layers"
          onClick={onClickAddLayers}
        />
        <Button
          id="compare-toggle-button"
          aria-label={compareBtnText}
          className="compare-toggle-button"
          style={!compareFeature ? { display: 'none' } : null}
          onClick={onClickToggleCompare}
          text={compareBtnText}
        />
        <Button
          id="chart-toggle-button"
          aria-label={chartBtnText}
          className="chart-toggle-button"
          style={!compareFeature ? { display: 'none' } : null}
          onClick={onClickToggleCompare}
          text={chartBtnText}
        />
      </div>
    </>
  );

  const renderEventsFooter = () => {
    const eventLimitReach = eventsData && eventsData.length === LIMIT_EVENT_REQUEST_COUNT;
    const numEvents = eventsData ? eventsData.length : 0;
    return (
      <div className="event-count">
        {eventsData && eventLimitReach ? (
          <>
            <span>
              {`Showing the first ${numEvents} events`}
            </span>
            <FontAwesomeIcon id="filter-info-icon" icon="info-circle" />
            <UncontrolledTooltip
              placement="right"
              target="filter-info-icon"
            >
              <div>
                More than
                {` ${LIMIT_EVENT_REQUEST_COUNT} `}
                events match the current filter criteria. Narrow your search by date, event type and/or map view.
              </div>
            </UncontrolledTooltip>
          </>
        ) : (
          <span>
            {`Showing ${numEvents} events`}
          </span>
        )}
      </div>
    );
  };

  return (
    <footer ref={ref}>
      {activeTab === 'layers' && renderLayersFooter()}
      {activeTab === 'events' && renderEventsFooter()}
    </footer>
  );
});

const mapStateToProps = (state) => {
  const {
    animation, config, compare, screenSize,
  } = state;
  const { isPlaying } = animation;
  const eventsData = getFilteredEvents(state);

  return {
    isMobile: screenSize.isMobileDevice,
    breakpoints: screenSize.breakpoints,
    screenWidth: screenSize.screenWidth,
    isPlaying,
    compareFeature: config.features.compare,
    isCompareActive: compare.active,
    compareMode: compare.mode,
    eventsData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  toggleCompare: () => {
    dispatch(toggleCompareOnOff());
  },
  changeCompareMode: (str) => {
    dispatch(changeMode(str));
  },
  addLayers: (isPlaying) => {
    const modalClassName = isMobileOnly || isTablet ? 'custom-layer-dialog-mobile custom-layer-dialog light' : 'custom-layer-dialog light';
    if (isPlaying) {
      dispatch(stopAnimationAction());
    }
    dispatch(
      openCustomContent('LAYER_PICKER_COMPONENT', {
        headerText: null,
        modalClassName,
        backdrop: true,
        CompletelyCustomModal: SearchUiProvider,
        wrapClassName: '',
      }),
    );
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(FooterContent);

FooterContent.propTypes = {
  activeTab: PropTypes.string,
  addLayers: PropTypes.func,
  changeCompareMode: PropTypes.func,
  compareFeature: PropTypes.bool,
  compareMode: PropTypes.string,
  eventsData: PropTypes.array,
  isCompareActive: PropTypes.bool,
  isMobile: PropTypes.bool,
  screenWidth: PropTypes.number,
  breakpoints: PropTypes.object,
  isPlaying: PropTypes.bool,
  toggleCompare: PropTypes.func,
};
