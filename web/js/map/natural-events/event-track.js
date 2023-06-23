import { useState, useEffect, useRef } from 'react';
import * as olExtent from 'ol/extent';
import * as olProj from 'ol/proj';
import {
  each as lodashEach,
  debounce as lodashDebounce,
} from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import {
  getClusters,
} from './cluster';
import { selectEvent as selectEventAction } from '../../modules/natural-events/actions';
import { getFilteredEvents } from '../../modules/natural-events/selectors';
import { CRS } from '../../modules/map/constants';
import usePrevious from '../../util/customHooks';

import {
  getTrackLines, getTrackPoint, getArrows, getClusterPointEl,
} from './util';

const removePointOverlays = (map, pointsAndArrows) => {
  lodashEach(pointsAndArrows, (pointOverlay) => {
    if (map.getOverlayById(pointOverlay.getId())) {
      map.removeOverlay(pointOverlay);
    }
  });
};

const addPointOverlays = (map, pointOverlayArray) => {
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
const getTracksAndPoints = function (eventObj, proj, map, selectedDate, callback, showAllTracks) {
  const pointsAndArrows = [];
  const trackSegments = [];
  const { clusters, firstClusterObj, secondClusterObj } = getClusters(eventObj, proj, selectedDate, map, showAllTracks);

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

function addOverlayIfIsVisible (map, overlay) {
  const extent = map.getView().calculateExtent();
  const position = overlay.getPosition();
  if (olExtent.containsCoordinate(extent, position)) {
    map.addOverlay(overlay);
  }
}

function EventTrack () {
  const dispatch = useDispatch();
  const selectEvent = (id, date) => dispatch(selectEventAction(id, date));
  const {
    eventsData,
    isAnimatingToEvent,
    isPlaying,
    map,
    extent,
    proj,
    selectedDate,
    selectedEvent,
    showAllTracks,
  } = useSelector((state) => ({
    eventsData: getFilteredEvents(state),
    isAnimatingToEvent: state.animation.isAnimatingToEvent,
    isPlaying: state.animation.isPlaying,
    map: state.map.ui.selected,
    extent: state.map.extent,
    proj: state.proj,
    selectedDate: state.date.selected,
    selectedEvent: state.events.selected,
    showAllTracks: state.events.showAllTracks,
  }));

  const [trackDetails, setTrackDetails] = useState({});
  const [allTrackDetails, setAllTrackDetails] = useState([]);
  const trackDetailsRef = useRef();
  trackDetailsRef.current = trackDetails;
  const allTrackDetailsRef = useRef();
  allTrackDetailsRef.current = allTrackDetails;
  const showAllTracksRef = useRef(showAllTracks);
  useEffect(() => {
    showAllTracksRef.current = showAllTracks;
  }, [showAllTracks]);


  // $$$ This function merely gets the selected event data from the events data and calls the update() function with that data, will likely not need it $$$
  const updateCurrentTrack = () => {
    const { id, date } = selectedEvent;
    if (!selectedEvent.id || !selectedEvent.date) return;
    const event = (eventsData || []).find((e) => e.id === id);
    if (!event) return;
    update(event, date);
  };

  const onPropertyChange = (e) => {
    if (showAllTracksRef.current && !allTrackDetailsRef.current.length) return;
    if (showAllTracksRef.current && (e.key === 'resolution' || e.key === 'rotation')) {
      removeAllTracks(map);
    }
    if (!trackDetails.id) return;
    if (e.key === 'resolution' || e.key === 'rotation') {
      const newTrackDetails = trackDetails.id ? removeTrack(map) : {};
      setTrackDetails(newTrackDetails);
    }
  };

  const addTrack = (map, { track, pointsAndArrows }) => {
    if (!isAnimatingToEvent && typeof track !== 'undefined') {
      map.addOverlay(track);
      addPointOverlays(map, pointsAndArrows);
    }
  };

  const removeTrack = (map) => {
    if (!map) return;
    const { track, pointsAndArrows } = trackDetailsRef.current;
    map.removeOverlay(track);
    removePointOverlays(map, pointsAndArrows);

    return {};
  };

  const removeAllTracks = (map) => {
    allTrackDetailsRef.current?.forEach((trackDetail) => {
      const { pointsAndArrows } = trackDetail.newTrackDetails;
      const { track } = trackDetail.newTrackDetails;
      map.removeOverlay(track);
      removePointOverlays(map, pointsAndArrows);
    });
  };

  const updateAllTracks = () => {
    let newTrackDetails;
    const allTracks = [];

    const createAndAddTrack = (singleEvent, eventID, eventDate) => {
      const {
        track,
        pointsAndArrows,
      } = getTracksAndPoints(singleEvent, proj, map, eventDate, selectEvent, showAllTracksRef.current);

      newTrackDetails = {
        id: eventID,
        selectedDate: eventDate,
        track,
        pointsAndArrows,
        hidden: false,
      };
      allTracks.push({ newTrackDetails });
      addTrack(map, newTrackDetails);
    };

    if (allTrackDetailsRef.current.length) {
      removeAllTracks(map);
    }

    eventsData.forEach((event) => {
      const eventID = event.id;
      const eventDate = event.geometry[0].date.slice(0, 10);
      if (event.geometry.length > 1 && eventID !== trackDetailsRef.current.id) {
        createAndAddTrack(event, eventID, eventDate);
      }
    });

    setAllTrackDetails(allTracks);
  };


  const update = (event, date) => {
    let newTrackDetails;
    const sameEvent = event && trackDetailsRef.current.id === event.id;
    const sameDate = trackDetailsRef.current.selectedDate === date;

    const createAndAddTrack = () => {
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
      addTrack(map, newTrackDetails);
    };

    if (!event || event.geometry.length < 2) {
      newTrackDetails = trackDetailsRef.current.id ? removeTrack(map) : {};
    } else if (trackDetailsRef.current.id) {
      if (sameEvent && !sameDate) {
        const isClusteredSelection = !document.getElementById(`track-marker-${date}`);
        // If New Date is in cluster build new track
        if (isClusteredSelection) {
          newTrackDetails = removeTrack(map);
          createAndAddTrack();
        } else {
          // Just update classNames
          newTrackDetails = trackDetailsRef.current;
          updateSelection(date);
          newTrackDetails.selectedDate = date;
        }
      } else {
        // Remove old DOM Elements
        newTrackDetails = removeTrack(map);
        createAndAddTrack();
      }
    } else {
      // If no track element currenlty exists,
      // but there is a multiday event, build a new track
      createAndAddTrack();
    }
    setTrackDetails(newTrackDetails);
  };

  // debounce delays the function call by a set amount of time. in this case 50 milliseconds
  const debouncedTrackUpdate = lodashDebounce(updateCurrentTrack, 50);
  const debouncedOnPropertyChange = lodashDebounce(
    onPropertyChange.bind(this),
    100,
    { leading: true, trailing: true },
  );
  const debouncedUpdateAllTracks = lodashDebounce(updateAllTracks, 50);

  const initialize = () => {
    if (!map) return;
    map.getView().on('propertychange', debouncedOnPropertyChange);
    map.once('postrender', () => { debouncedTrackUpdate(); });
    if (showAllTracksRef.current) {
      map.once('postrender', () => { debouncedUpdateAllTracks(); });
    }
  };

  useEffect(
    () => {
      initialize();

      return () => {
        update(null);
        map?.getView()?.un('propertychange', debouncedOnPropertyChange);
        if (showAllTracksRef.current) {
          removeAllTracks(map);
        }
      };
    },
    [],
  );

  const prevSelectedDate = usePrevious(selectedDate);
  const prevSelectedEvent = usePrevious(selectedEvent);
  const prevIsAnimatingToEvent = usePrevious(isAnimatingToEvent);
  const prevEventsData = usePrevious(eventsData);
  const prevMap = usePrevious(map);
  const prevExtent = usePrevious(extent);
  const prevShowAllTracks = usePrevious(showAllTracks);

  useEffect(
    () => {
      const selectedDateChange = (selectedDate && selectedDate.valueOf())
        !== (prevSelectedDate && prevSelectedDate?.valueOf());
      const eventDeselect = (selectedEvent !== prevSelectedEvent?.id) && !selectedEvent?.id;
      const finishedAnimating = !isAnimatingToEvent && (isAnimatingToEvent !== prevIsAnimatingToEvent);
      const eventsLoaded = eventsData && eventsData.length && (eventsData !== prevEventsData);
      const extentChange = prevExtent && (extent[0] !== prevExtent[0] || extent[1] !== prevExtent[1]);

      if (map !== prevMap) {
        if (prevMap) {
          update(null);
          removeTrack(prevMap);
          removePointOverlays(prevMap, trackDetailsRef.current.pointsAndArrows);
          if (showAllTracksRef.current) {
            removeAllTracks(prevMap);
          }
        }
        initialize();
      }

      // remove all tracks when deselecting option
      if (!showAllTracksRef.current && prevShowAllTracks !== showAllTracks) {
        removeAllTracks(map);
      }

      // show all tracks when selecting as option
      if (showAllTracksRef.current && !isPlaying && (prevShowAllTracks !== showAllTracksRef.current || selectedDateChange || finishedAnimating || eventsLoaded || extentChange)) {
        debouncedUpdateAllTracks();
      }

      // show only selected track if show all tracks is not selected
      if (!isPlaying && !showAllTracksRef.current && (selectedDateChange || finishedAnimating || eventsLoaded || extentChange)) {
        debouncedTrackUpdate();
      }

      // only remove selected track when event is deselected
      if (eventDeselect && !showAllTracksRef.current) {
        removeTrack(map);
      }
    },
    [map, isPlaying, extent, selectedDate, isAnimatingToEvent, eventsData, selectedEvent, showAllTracksRef.current],
  );

  return null;
}

export default EventTrack;

