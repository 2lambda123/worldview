import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  findIndex as lodashFindIndex,
  get as lodashGet,
} from 'lodash';
import {
  getActiveLayers,
  getAllActiveLayers,
  getActiveLayerGroup,
  getGranuleCount,
} from '../../../modules/layers/selectors';
import { setStyleFunction } from '../../../modules/vector-styles/selectors';
import { getSelectedDate } from '../../../modules/date/selectors';
import * as dateConstants from '../../../modules/date/constants';
import * as layerConstants from '../../../modules/layers/constants';
import { UPDATE_LATEST_IMAGERY_TIME } from '../../../modules/settings/constants'
import { triggerTodayButton as triggerUpdateAction } from '../../../modules/date/actions'

function UpdateDate(props) {
  const {
    action,
    compareMapUi,
    getGranuleOptions,
    preloadNextTiles,
    ui,
    updateLayerVisibilities,
  } = props;

  // redux state
  const {
    compare, date, layers, proj, vectorStyles, config, map, settings,
  } = useSelector((state) => state);
  const dateCompareState = { date, compare };
  const granuleState = { compare, layers };
  const layerState = { compare, map };
  const vectorStyleState = { proj, vectorStyles, config };
  const activeLayers = getActiveLayers(useSelector((state) => state));
  const allActiveLayers = getAllActiveLayers(useSelector((state) => state))
  const isCompareActive = compare.active;
  const { activeString } = compare;
  const { isActive, interval } = settings.updateLatestImageryAndTime

  // redux actions
  const dispatch = useDispatch();
  const triggerUpdate = () => {
    console.log('dispatching update action')
    dispatch(triggerUpdateAction())
  }

  useEffect(() => {
    actionSwitch();
  }, [action]);

  const actionSwitch = () => {
    if (action.type === dateConstants.SELECT_DATE) {
      if (ui.processingPromise) {
        return new Promise((resolve) => {
          resolve(ui.processingPromise);
        }).then(() => {
          ui.processingPromise = null;
          return updateDate(action.outOfStep);
        });
      }
      return updateDate(action.outOfStep);
    } if (action.type === layerConstants.TOGGLE_LAYER_VISIBILITY || action.type === layerConstants.TOGGLE_OVERLAY_GROUP_VISIBILITY) {
      return updateDate();
    }
    if (action.type === UPDATE_LATEST_IMAGERY_TIME){
      handleLatestImagerySettingUpdate()
    }
  };

  // =================== TIMER STUFF ==============================
  // ref for persistent timer
  const intervalId = useRef(null);

  const startInterval = () => {
    console.log('starting interval')
    intervalId.current = setInterval(() => {
      triggerUpdate();
    }, interval); // 5 seconds in milliseconds
  }

  const stopInterval = () => {
    console.log('stopping interval')
    clearInterval(intervalId.current);
    intervalId.current = null;
  };

  const handleLatestImagerySettingUpdate = () => {
    console.log('handle call... updateLatestImageryState ==', isActive)
    isActive ? startInterval() : stopInterval();
  }

  // =================== END TIMER STUFF ==============================

  function findLayerIndex({ id }) {
    const layerGroup = getActiveLayerGroup(layerState);
    const layers = layerGroup.getLayers().getArray();
    return lodashFindIndex(layers, {
      wv: { id },
    });
  }

  function updateVectorStyles (def) {
    const { vectorStyles } = config;
    const layerName = def.layer || def.id;
    let vectorStyleId;

    vectorStyleId = def.vectorStyle.id;
    if (activeLayers) {
      activeLayers.forEach((layer) => {
        if (layer.id === layerName && layer.custom) {
          vectorStyleId = layer.custom;
        }
      });
    }
    setStyleFunction(def, vectorStyleId, vectorStyles, null, vectorStyleState);
  }

  async function updateCompareLayer (def, index, layerCollection) {
    const { createLayer } = ui;
    const options = {
      group: activeString,
      date: getSelectedDate(dateCompareState),
      ...getGranuleOptions(granuleState, def, activeString),
    };
    const updatedLayer = await createLayer(def, options);
    layerCollection.setAt(index, updatedLayer);
    compareMapUi.update(activeString);
  }

  async function updateDate(outOfStepChange) {
    const { createLayer } = ui;

    const layerGroup = getActiveLayerGroup(layerState);
    const mapLayerCollection = layerGroup.getLayers();
    const layers = mapLayerCollection.getArray();
    // const activeLayers = getAllActiveLayers(state);

    const visibleLayers = allActiveLayers.filter(
      ({ id }) => layers
        .map(({ wv }) => lodashGet(wv, 'def.id'))
        .includes(id),
    ).filter(({ visible }) => visible);

    const layerPromises = visibleLayers.map(async (def) => {
      const { id, type } = def;
      const temporalLayer = ['subdaily', 'daily', 'monthly', 'yearly']
        .includes(def.period);
      const index = findLayerIndex(def);
      const hasVectorStyles = config.vectorStyles && lodashGet(def, 'vectorStyle.id');
      if (isCompareActive && layers.length) {
        await updateCompareLayer(def, index, mapLayerCollection);
      } else if (temporalLayer) {
        if (index !== undefined && index !== -1) {
          const layerValue = layers[index];
          const layerOptions = type === 'granule'
            ? { granuleCount: getGranuleCount(granuleState, id) }
            : { previousLayer: layerValue ? layerValue.wv : null };
          const updatedLayer = await createLayer(def, layerOptions);
          mapLayerCollection.setAt(index, updatedLayer);
        }
      }
      if (hasVectorStyles && temporalLayer) {
        updateVectorStyles(def);
      }
    });
    await Promise.all(layerPromises);
    updateLayerVisibilities();
    if (!outOfStepChange) {
      preloadNextTiles();
    }
  }

  return null;
}

// const mapStateToProps = (state) => {
//   const {
//     compare, date, layers, proj, vectorStyles, config, map,
//   } = state;
//   const dateCompareState = { date, compare };
//   const { activeString } = compare;
//   const activeLayers = getActiveLayers(state);
//   const isCompareActive = compare.active;
//   const granuleState = { compare, layers };
//   const layerState = { compare, map };
//   const vectorStyleState = { proj, vectorStyles, config };

//   return {
//     activeLayers,
//     activeString,
//     dateCompareState,
//     granuleState,
//     isCompareActive,
//     layerState,
//     state,
//     vectorStyleState,
//   };
// };

export default UpdateDate;

UpdateDate.propTypes = {
  action: PropTypes.object,
  activeLayers: PropTypes.array,
  activeString: PropTypes.string,
  compareMapUi: PropTypes.object,
  config: PropTypes.object,
  dateCompareState: PropTypes.object,
  getGranuleOptions: PropTypes.func,
  granuleState: PropTypes.object,
  isComparActive: PropTypes.bool,
  layerState: PropTypes.object,
  preloadNextTiles: PropTypes.func,
  state: PropTypes.object,
  ui: PropTypes.object,
  updateLayerVisibilities: PropTypes.func,
  vectorStyleState: PropTypes.object,
};
