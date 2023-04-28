import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleActiveCompareState as toggleActiveCompareStateAction } from '../../modules/compare/actions';

function MobileComparisonToggle() {
  const { active, isCompareA } = useSelector((state) => ({
    active: state.compare.active,
    isCompareA: state.compare.isCompareA,
  }));
  const dispatch = useDispatch();
  const toggleActiveCompareState = () => dispatch(toggleActiveCompareStateAction());

  const classA = isCompareA ? 'compare-btn-selected' : '';
  const classB = !isCompareA ? 'compare-btn-selected' : '';

  const handleClick = (selected) => {
    if (selected !== isCompareA) {
      toggleActiveCompareState();
    }
  };

  return active ? (
    <div className="comparison-mobile-select-toggle">
      <div
        className={`compare-toggle-selected-btn ${classA}`}
        onClick={() => handleClick(true)}
      >
        A
      </div>
      <div
        className={`compare-toggle-selected-btn ${classB}`}
        onClick={() => handleClick(false)}
      >
        B
      </div>
    </div>
  ) : null;
}

export default MobileComparisonToggle;
