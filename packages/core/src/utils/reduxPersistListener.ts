import { Store } from "redux";
import { getStoredState, PersistConfig, REHYDRATE } from "redux-persist";
import { RootState } from "../state/declaration";

export default function crossBrowserListener(
  store: Store<RootState>,
  persistConfig: PersistConfig<RootState>
) {
  return async function() {
    const state = await getStoredState(persistConfig);

    store.dispatch({
      type: REHYDRATE,
      key: persistConfig.key,
      payload: state,
    });
  };
}
