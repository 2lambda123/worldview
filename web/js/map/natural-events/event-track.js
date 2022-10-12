import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as olExtent from 'ol/extent';
import * as olProj from 'ol/proj';
import {
  each as lodashEach,
  debounce as lodashDebounce,
} from 'lodash';

import {
  getClusters,
} from './cluster';
import { selectEvent as selectEventAction } from '../../modules/natural-events/actions';
import { getFilteredEvents } from '../../modules/natural-events/selectors';
import { CRS } from '../../modules/map/constants';

import {
  getTrackLines, getTrackPoint, getArrows, getClusterPointEl,
} from './util';

class EventTrack extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      trackDetails: {},
    };

    // debounce delays the function call by a set amount of time. in this case 50 milliseconds
    this.debouncedTrackUpdate = lodashDebounce(this.updateCurrentTrack, 50);
    this.debouncedOnPropertyChange = lodashDebounce(
      this.onPropertyChange.bind(this),
      100,
      { leading: true, trailing: true },
    );
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    const {
      isPlaying, map, extent, selectedDate, isAnimatingToEvent, eventsData, selectedEvent, showAllTracks,
    } = this.props;
    const selectedDateChange = (selectedDate && selectedDate.valueOf())
      !== (prevProps.selectedDate && prevProps.selectedDate.valueOf());
    const eventDeselect = (selectedEvent !== prevProps.selectedEvent.id) && !selectedEvent.id;
    const finishedAnimating = !isAnimatingToEvent && (isAnimatingToEvent !== prevProps.isAnimatingToEvent);
    const eventsLoaded = eventsData && eventsData.length && (eventsData !== prevProps.eventsData);
    const prevMap = prevProps.map;
    const prevExtent = prevProps.extent;
    const extentChange = prevExtent && (extent[0] !== prevExtent[0] || extent[1] !== prevExtent[1]);
    const { trackDetails } = this.state;

    if (map !== prevMap) {
      if (prevMap) {
        this.update(null);
        this.removeTrack(prevMap);
        removePointOverlays(prevMap, trackDetails.pointsAndArrows);
      }
      this.initialize();
    }

    // if an animation isn't playing and any of the props are updated, call the delayed track update
    if (!isPlaying && (selectedDateChange || finishedAnimating || eventsLoaded || extentChange)) {
      this.debouncedTrackUpdate();
    }

    // this is only called when you click on an active event to close it without opening another one
    if (eventDeselect) {
      this.removeTrack(map);
    }

    if (showAllTracks) {
      this.updateAllTracks();
    }
  }

  componentWillUnmount() {
    const { map } = this.props;
    this.update(null);
    map.getView().un('propertychange', this.debouncedOnPropertyChange);
  }

  initialize() {
    const { map } = this.props;
    if (!map) return;
    map.getView().on('propertychange', this.debouncedOnPropertyChange);
    map.once('postrender', () => { this.debouncedTrackUpdate(); });
  }

  // uses data from redux store to find the selected event within the eventsData array
  // eventsData is an array of objects of all the events that appear in the sidebar
  // if there is a selected event, the update function is called and finds the index associated with the id of the selectedEvent in the eventsData array
  // this method is called in the constructor and debounced as debouncedTrackUpdate
  // $$$ This function merely gets the selected event data from the events data and calls the update() function with that data, will likely not need it $$$
  updateCurrentTrack() {
    const { selectedEvent, eventsData } = this.props;
    const { id, date } = selectedEvent;
    if (!selectedEvent.id || !selectedEvent.date) return;
    const event = (eventsData || []).find((e) => e.id === id);
    if (!event) return;
    this.update(event, date);
  }

  // this function listens for events when the map is zoomed in or out or the map is rotated
  // if there are current trackDetails then we remove the current track by calling the removeTrack funtion
  // this function is debounced and binded in the constructor and used within the react lifecycle functions
  onPropertyChange = (e) => {
    const { map } = this.props;
    const { trackDetails } = this.state;
    if (!trackDetails.id) return;
    if (e.key === 'resolution' || e.key === 'rotation') {
      const newTrackDetails = trackDetails.id ? this.removeTrack(map) : {};
      this.setState({ trackDetails: newTrackDetails });
    }
  }

  // this is only used in the createAndAddTrack() function within the update function
  addTrack = (map, { track, pointsAndArrows }) => {
    map.addOverlay(track);
    addPointOverlays(map, pointsAndArrows);
  }

  // this function is used in several places to remove tracks
  removeTrack = function(map) {
    const { trackDetails } = this.state;
    const { track, pointsAndArrows } = trackDetails;
    map.removeOverlay(track);
    removePointOverlays(map, pointsAndArrows);
    return {};
  };

  // we have to loop through the eventsData and do something similar to what is happening when updateCurrentTrack() calls this.update(event, date)
  updateAllTracks = () => {
    const {
      proj, map, eventsData,
    } = this.props;
    let newTrackDetails;

    const createAndAddTrack = (singleEvent, eventID, eventDate) => {
      const {
        track,
        pointsAndArrows,
      } = getTracksAndPoints(singleEvent, proj, map, eventDate);

      newTrackDetails = {
        id: eventID,
        selectedDate: eventDate,
        track,
        pointsAndArrows,
        hidden: false,
      };
      this.addTrack(map, newTrackDetails);
    };

    console.log('eventsData', eventsData);

    eventsData.map((singleEvent) => {
      const eventID = singleEvent.id;
      const eventDate = singleEvent.geometry[0].date.slice(0, 10);
      return createAndAddTrack(singleEvent, eventID, eventDate);
    });
  }



  /**
   * Update track
   *
   * @param  {Object} event EONET event object
   * @param  {String} selectedDate
   */
  update = function(event, date) {
    const {
      proj, map, selectEvent,
    } = this.props;
    const { trackDetails } = this.state;
    let newTrackDetails;
    const sameEvent = event && trackDetails.id === event.id;
    const sameDate = trackDetails.selectedDate === date;

    // this method is used within the if else statement below to create and add new tracks for the selected event
    // $$$ Will likely need to figure out how to use this function to map over all of the events data and create tracks $$$
    const createAndAddTrack = () => {
      // we pass this method a bunch of parameters including the selected event and it returns the track and points that we set in the newTrackDetails object below
      const {
        track,
        pointsAndArrows,
      } = getTracksAndPoints(event, proj, map, date, selectEvent);

      newTrackDetails = {
        id: event.id,
        selectedDate: date,
        track,
        pointsAndArrows,
        hidden: false,
      };
      this.addTrack(map, newTrackDetails);
    };

    if (!event || event.geometry.length < 2) {
      newTrackDetails = trackDetails.id ? this.removeTrack(map) : {};
    } else if (trackDetails.id) {
      if (sameEvent && !sameDate) {
        const isClusteredSelection = !document.getElementById(`track-marker-${date}`);
        // If New Date is in cluster build new track
        if (isClusteredSelection) {
          newTrackDetails = this.removeTrack(map);
          createAndAddTrack();
        } else {
          // Just update classNames
          newTrackDetails = trackDetails;
          updateSelection(date);
          newTrackDetails.selectedDate = date;
        }
      } else {
        // Remove old DOM Elements
        newTrackDetails = this.removeTrack(map);
        createAndAddTrack();
      }
    } else {
      // If no track element currenlty exists,
      // but there is a multiday event, build a new track
      createAndAddTrack();
    }
    this.setState({ trackDetails: newTrackDetails });
  };

  render() {
    return null;
  }
}

const removePointOverlays = function(map, pointsAndArrows) {
  lodashEach(pointsAndArrows, (pointOverlay) => {
    if (map.getOverlayById(pointOverlay.getId())) {
      map.removeOverlay(pointOverlay);
    }
  });
};

const addPointOverlays = function(map, pointOverlayArray) {
  lodashEach(pointOverlayArray, (pointOverlay) => {
    addOverlayIfIsVisible(map, pointOverlay);
  });
};

/**
 * Change selected point
 *
 * @param  {String} newDate
 * @return {void}
 */
const updateSelection = function(newDate) {
  const oldSelectedPoint = document.getElementsByClassName(
    'track-marker-case-selected',
  )[0];
  const newSelectedPoint = document.getElementById(
    `track-marker-case-${newDate}`,
  );
  if (oldSelectedPoint) oldSelectedPoint.className = 'track-marker-case';
  newSelectedPoint.className = 'track-marker-case track-marker-case-selected';
};

/**
 * Loop through clustered point array and create elements
 *
 * @param {Array} clusters Array of cluster objects
 * @param {Object} map OpenLayers map Object
 * @param {String} selectedDate
 * @param {Function} callback
 * @return {Object} Object Containing track info and elements
 */
const getTracksAndPoints = function(eventObj, proj, map, selectedDate, callback) {
  const pointsAndArrows = [];
  const trackSegments = [];
  const { clusters, firstClusterObj, secondClusterObj } = getClusters(eventObj, proj, selectedDate, map);

  clusters.forEach((clusterPoint, index) => {
    const date = clusterPoint.properties.date || clusterPoint.properties.startDate;
    const isSelected = selectedDate === date;
    const pointClusterObj = new Date(date) > new Date(selectedDate)
      ? firstClusterObj
      : secondClusterObj;
    if (index !== 0) {
      let prevCoordinates = clusters[index - 1].geometry.coordinates;
      let nextCoordinates = clusterPoint.geometry.coordinates;
      // polar projections require transform of coordinates to crs
      if (proj.selected.id !== 'geographic') {
        const { crs } = proj.selected;
        prevCoordinates = olProj.transform(prevCoordinates, CRS.GEOGRAPHIC, crs);
        nextCoordinates = olProj.transform(nextCoordinates, CRS.GEOGRAPHIC, crs);
      }
      const lineSegmentArray = [prevCoordinates, nextCoordinates];
      const arrowOverlay = getArrows(lineSegmentArray, map);
      pointsAndArrows.push(arrowOverlay);
      trackSegments.push(lineSegmentArray);
    }
    const point = clusterPoint.properties.cluster
      ? getClusterPointEl(proj, clusterPoint, map, pointClusterObj, callback)
      : getTrackPoint(proj, clusterPoint, isSelected, callback);
    pointsAndArrows.push(point);
  });
  return {
    track: getTrackLines(map, trackSegments),
    pointsAndArrows,
  };
};

function addOverlayIfIsVisible(map, overlay) {
  const extent = map.getView().calculateExtent();
  const position = overlay.getPosition();
  if (olExtent.containsCoordinate(extent, position)) {
    map.addOverlay(overlay);
  }
}

const mapStateToProps = (state) => {
  const {
    map, proj, events, date, animation,
  } = state;
  const { isAnimatingToEvent } = events;
  const { isPlaying } = animation;
  return {
    eventsData: getFilteredEvents(state),
    isAnimatingToEvent,
    isPlaying,
    map: map.ui.selected,
    extent: map.extent,
    proj,
    selectedDate: date.selected,
    selectedEvent: events.selected,
    showAllTracks: events.showAllTracks,
  };
};

const mapDispatchToProps = (dispatch) => ({
  selectEvent: (id, date) => {
    dispatch(selectEventAction(id, date));
  },
});

EventTrack.propTypes = {
  eventsData: PropTypes.array,
  isAnimatingToEvent: PropTypes.bool,
  isPlaying: PropTypes.bool,
  map: PropTypes.object,
  extent: PropTypes.array,
  proj: PropTypes.object,
  selectEvent: PropTypes.func,
  selectedEvent: PropTypes.object,
  selectedDate: PropTypes.object,
  showAllTracks: PropTypes.bool,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EventTrack);
