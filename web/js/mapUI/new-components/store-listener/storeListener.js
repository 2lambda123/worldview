import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const useStoreListener = (actionType, callback) => {
  const storeAction = useSelector((state) => state.lastAction);

  useEffect(() => {
    if (storeAction.type === actionType) {
      callback(storeAction);
    }
  }, [storeAction, actionType, callback]);
};

export default useStoreListener;