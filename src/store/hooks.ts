// import from deep path to avoid Metro export field issues
import {
    TypedUseSelectorHook,
    useDispatch,
    useSelector,
} from "react-redux/dist/react-redux.js";
import type { AppDispatch, RootState } from "./store";

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
