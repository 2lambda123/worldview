import safeLocalStorage from '../../util/local-storage';
import {
  CHANGE_TEMPERATURE_UNIT,
  CHANGE_DATELINE_VISIBILITY,
  CHANGE_COORDINATE_FORMAT,
  UPDATE_LATEST_IMAGERY_TIME
} from './constants';

const { GLOBAL_TEMPERATURE_UNIT, ALWAYS_SHOW_DATELINES, COORDINATE_FORMAT } = safeLocalStorage.keys;

export const initialState = {
  globalTemperatureUnit: '',
  alwaysShowDatelines: false,
  coordinateFormat: '',
  updateLatestImageryAndTime: {
    isActive: false,
    interval: null,
    title: ''
  },
};

export function getInitialState() {
  const alwaysShowDatelines = Boolean(safeLocalStorage.getItem(ALWAYS_SHOW_DATELINES));
  const initialCoordinateFormat = safeLocalStorage.getItem(COORDINATE_FORMAT);
  const defaultCoordinateFormat = 'latlon-dd';
  const defaultLatestImageryAndTime = {
    isActive: false,
    interval: 5000,
    title: '5 sec'
  }

  if (initialCoordinateFormat === null) {
    return {
      globalTemperatureUnit: safeLocalStorage.getItem(GLOBAL_TEMPERATURE_UNIT),
      alwaysShowDatelines,
      coordinateFormat: defaultCoordinateFormat,
      updateLatestImageryAndTime: defaultLatestImageryAndTime
    };
  }

  return {
    globalTemperatureUnit: safeLocalStorage.getItem(GLOBAL_TEMPERATURE_UNIT),
    alwaysShowDatelines,
    coordinateFormat: safeLocalStorage.getItem(COORDINATE_FORMAT),
    updateLatestImageryAndTime: defaultLatestImageryAndTime
  };
}

export const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_TEMPERATURE_UNIT:
      return {
        ...state,
        globalTemperatureUnit: action.value,
      };
    case CHANGE_DATELINE_VISIBILITY: {
      return {
        ...state,
        alwaysShowDatelines: action.value,
      };
    }
    case CHANGE_COORDINATE_FORMAT: {
      return {
        ...state,
        coordinateFormat: action.value,
      };
    }
    case UPDATE_LATEST_IMAGERY_TIME: {
      return {
        ...state,
        updateLatestImageryAndTime: action.payload,
      }
    }
    default:
      return state;
  }
};
