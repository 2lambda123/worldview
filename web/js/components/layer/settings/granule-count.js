import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';

class GranuleCountSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.start
    };
  }

  render() {
    const {
      layer,
      updateGranuleLayerDates,
      granuleDates,
      projection,
      start
    } = this.props;
    return (
      <div className="layer-granule-count-select settings-component">
        <h2 className="wv-header">Granule Count</h2>
        <Slider
          min={1}
          max={50}
          defaultValue={start}
          onChange={val => {
            updateGranuleLayerDates(granuleDates, layer.id, projection, val);
            this.setState({ value: val });
          }}
        />
        <div className="wv-label wv-label-granule-count">
          {this.state.value}
        </div>
      </div>
    );
  }
}
GranuleCountSlider.defaultProps = {
  start: 20
};
GranuleCountSlider.propTypes = {
  granuleDates: PropTypes.array,
  layer: PropTypes.object,
  projection: PropTypes.string,
  start: PropTypes.number,
  updateGranuleLayerDates: PropTypes.func
};

export default GranuleCountSlider;
