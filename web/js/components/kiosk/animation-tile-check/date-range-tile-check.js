import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OlTileGridWMTS from 'ol/tilegrid/WMTS';
import OlSourceWMTS from 'ol/source/WMTS';
import OlLayerTile from 'ol/layer/Tile';
import TileState from 'ol/TileState';
import OlTileGridTileGrid from 'ol/tilegrid/TileGrid';
import PropTypes from 'prop-types';

function DateRangeTileCheck(props) {
  const {
    frameDates,
    activeLayers,
  } = props;

  useEffect(() => {
    if (frameDates.length){
      // console.log('frameDates', frameDates, 'activeLayers', activeLayers)
      parentFunction(activeLayers)
    }

  }, [frameDates])

  function checkTileAvailability(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = url;
    });
  }

  const wmtsUrlFunction = (layer, date) => async function(tile, src) {

  }

  // #3 child function that accepts an array of frame dates and a layer and returns availability for the range
  async function checkTilesForDates(dates, tileUrlFunction) {
    const availability = {
      availableTiles: [],
      unavailableTiles: [],
    };

    for (const date of dates) {
      const tileUrl = tileUrlFunction(date); // Replace with your tile URL generation logic
      const isAvailable = await checkTileAvailability(tileUrl);

      if (isAvailable) {
        availability.availableTiles.push(date);
      } else {
        availability.unavailableTiles.push(date);
      }
    }
    return availableDates;
  }

  // #2 child function that accepts one layer and returns results for that layer
  function getAvailabilityForLayer(layer) {
    console.log(layer)
    const tileGrid = layer.getSource().getTileGrid();
    const tileUrlFunction = layer.getSource().getTileUrlFunction();
    console.log('tileGrid ', tileGrid, 'tileUrlFunction', tileUrlFunction, `layer.id ${layer.id}`)

    const id = layer.id
    return id
  }

  // parent function that accepts activeLayers and returns final results
  function parentFunction(activeLayers) {

    const allLayersAvailability = activeLayers.map((layer) => {
      const layerAvailability = getAvailabilityForLayer(layer)
      return layerAvailability;
    })

    console.log(allLayersAvailability)
  }


  return null;
}

export default DateRangeTileCheck