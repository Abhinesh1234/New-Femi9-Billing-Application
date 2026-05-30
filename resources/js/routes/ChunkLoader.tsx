import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../core/redux/store";
import { startLoading, stopLoading } from "../core/redux/loaderSlice";

// Mounted by Suspense while a lazy chunk is loading.
// Registers the "chunk" source so the Preloader stays visible,
// and clears it when the chunk resolves and this component unmounts.
const ChunkLoader = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(startLoading("chunk"));
    return () => {
      dispatch(stopLoading("chunk"));
    };
  }, []);

  return null;
};

export default ChunkLoader;
