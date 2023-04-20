import { getNextDateTime } from '../../modules/date/util'
import { promiseImageryForTime } from '../../modules/map/util';
import {
  getActiveLayers,
  isRenderable as isRenderableLayer,
} from '../../modules/layers/selectors';
import { getSelectedDate } from '../../modules/date/selectors';

export async function preloadNextTiles(date, compareString, stateParam, ui, layerQueue ) {
  const map = { ui };
  const state = {
    ...stateParam, map
  };
  console.log(state)
  const { date: { preloaded, lastArrowDirection, arrowDown } } = state;
  const { compare: { activeString } } = state;

  const useActiveString = compareString || activeString;
  const useDate = date || (preloaded ? lastPreloadDate : getSelectedDate(state));
  const nextDate = getNextDateTime(state, 1, useDate);
  const prevDate = getNextDateTime(state, -1, useDate);
  const subsequentDate = lastArrowDirection === 'right' ? nextDate : prevDate;
  if (preloaded && lastArrowDirection) {
    setPreload(true, subsequentDate);
    layerQueue.add(() => promiseImageryForTime(state, subsequentDate, useActiveString));
    return;
  }
  layerQueue.add(() => promiseImageryForTime(state, nextDate, useActiveString));
  layerQueue.add(() => promiseImageryForTime(state, prevDate, useActiveString));
  if (!date && !arrowDown) {
    preloadNextTiles(subsequentDate, useActiveString);
  }
}

export const updateLayerVisibilities = (state, ui) => {
  const layerGroup = ui.selected.getLayers();

  const setRenderable = (layer, parentCompareGroup) => {
    const { id, group } = layer.wv;
    const dateGroup = layer.get('date') || group === 'active' ? 'selected' : 'selectedB';
    const date = getSelectedDate(state, dateGroup);
    const layers = getActiveLayers(state, parentCompareGroup || group);
    const renderable = isRenderableLayer(id, layers, date, null, state);
    layer.setVisible(renderable);
  };

  layerGroup.forEach((layer) => {
    const compareActiveString = layer.get('group');
    const granule = layer.get('granuleGroup');

    // Not in A|B
    if (layer.wv && !granule) {
      setRenderable(layer);

    // If in A|B layer-group will have a 'group' string
    } else if (compareActiveString || granule) {
      const compareGrouplayers = layer.getLayers().getArray();

      compareGrouplayers.forEach((subLayer) => {
        if (!subLayer.wv) {
          return;
        }
        // TileLayers within granule LayerGroup
        if (subLayer.get('granuleGroup')) {
          const granuleLayers = subLayer.getLayers().getArray();
          granuleLayers.forEach((l) => setRenderable(l));
          subLayer.setVisible(true);
        }
        setRenderable(subLayer, compareActiveString);
      });

      layer.setVisible(true);
    }
  });
};