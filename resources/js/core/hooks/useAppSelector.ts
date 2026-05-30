import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

/** Type-safe useSelector — eliminates `(state: any)` casts throughout the app. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Type-safe useDispatch — required for dispatching typed async thunks. */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
