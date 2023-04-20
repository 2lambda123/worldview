import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
  cloneDeep as lodashCloneDeep,
  findIndex as lodashFindIndex,
  find as lodashFind,
} from 'lodash';
import { getActiveLayers } from '../../../modules/layers/selectors';
import { ADD_LAYER } from '../../../modules/layers/constants';
import { clearPreload as clearPreloadAction } from '../../../modules/date/actions';
import useStoreListener from '../store-listener/storeListener'
import { preloadNextTiles, updateLayerVisibilities } from '../../util/util'

function AddLayer(props) {
  const {
    compareMapUi,
    layerQueue,
    ui,
  } = props;

  console.log('rerendering')

  const dispatch = useDispatch();

  const clearPreload = () => {
    dispatch(clearPreloadAction());
  };
  const { compare, date, proj, embed, layers, palettes, vectorStyles, map, } = useSelector((state) => state);
  const { activeString, mode } = compare;
  const { selected, selectedB } = date;
  const activeLayersState = useSelector(getActiveLayers);
  const compareDate = useSelector((state) => compare.active && activeString === 'activeB' ? selectedB : selected);
  const state = { compare, date, proj, embed, layers, palettes, vectorStyles }

//   useStoreListener(ADD_LAYER, (action) =>{
//     const def = lodashFind(action.layers, { id: action.id });
//     if (def.type === 'granule') {
//       return granuleLayerAdd(def);
//     }
//     clearPreload();
//     addLayer(def);

//   })

//   const granuleLayerAdd = (def) => {
//     ui.processingPromise = new Promise((resolve) => {
//       resolve(addLayer(def));
//     });
//   };

//   const stateParam = {
//     proj, embed, layers, palettes, vectorStyles, compare, date
//     };

//   /**
//  * Initiates the adding of a layer
//  * @param {object} def - layer Specs
//  * @returns {void}
//  */
//   const addLayer = async function(def, layerDate, activeLayersParam) {
//     const { createLayer } = ui;

//     const date = layerDate || compareDate;
//     const activeLayers = activeLayersParam || activeLayersState;
//     const reverseLayers = lodashCloneDeep(activeLayers).reverse();
//     const index = lodashFindIndex(reverseLayers, { id: def.id });
//     const mapLayers = ui.selected.getLayers().getArray();
//     const firstLayer = mapLayers[0];

//     if (firstLayer && firstLayer.get('group') && firstLayer.get('granule') !== true) {
//       const activelayer = firstLayer.get('group') === activeString
//         ? firstLayer
//         : mapLayers[1];
//       const options = {
//         date,
//         group: activeString,
//       };
//       const newLayer = await createLayer(def, options);
//       activelayer.getLayers().insertAt(index, newLayer);
//       compareMapUi.create(ui.selected, mode);
//     } else {
//       const newLayer = await createLayer(def);
//       ui.selected.getLayers().insertAt(index, newLayer);
//     }
//     updateLayerVisibilities(state, ui);
//     preloadNextTiles(null, null, stateParam, ui, layerQueue );
//   };
  return null;
}

// const mapStateToProps = (state) => {
//   const { compare, date } = state;
//   const { activeString, mode } = compare;
//   const { selected, selectedB } = date;
//   const activeLayersState = getActiveLayers(state);
//   const compareDate = compare.active && activeString === 'activeB' ? selectedB : selected;
//   return {
//     activeLayersState,
//     compareDate,
//     activeString,
//     mode,
//   };
// };

// const mapDispatchToProps = (dispatch) => ({
//   clearPreload: () => {
//     dispatch(clearPreload());
//   },
// });

export default AddLayer;

AddLayer.propTypes = {
  activeLayersState: PropTypes.array,
  activeString: PropTypes.string,
  action: PropTypes.object,
  clearPreload: PropTypes.func,
  compareMapUi: PropTypes.object,
  mode: PropTypes.string,
  preloadNextTiles: PropTypes.func,
  selected: PropTypes.object,
  updateLayerVisibilities: PropTypes.func,
  ui: PropTypes.object,
};
