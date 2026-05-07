import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../core/redux/store";
import { showFlash } from "../core/redux/flashSlice";

type Feature = "composite_items" | "price_lists";

interface Props {
  feature: Feature;
}

const LABELS: Record<Feature, string> = {
  composite_items: "Composite Items",
  price_lists:     "Price Lists",
};

/**
 * Wraps routes that require a product feature to be enabled.
 * If the feature is off, it fires the global toast and redirects to /items
 * with no blank-page flash (settings are loaded before routes open via AuthProvider).
 */
const FeatureGuard = ({ feature }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const blocked  = useRef(false);

  const { isLoaded, enableCompositeItems, enablePriceLists } = useSelector(
    (state: RootState) => state.productSettings
  );

  const isEnabled =
    feature === "composite_items" ? enableCompositeItems : enablePriceLists;

  useEffect(() => {
    if (!isLoaded || isEnabled || blocked.current) return;
    blocked.current = true;
    dispatch(showFlash({
      message: `${LABELS[feature]} is not enabled. Enable it in Product Settings.`,
      type:    "danger",
    }));
    navigate("/items", { replace: true });
  }, [isLoaded, isEnabled]);

  if (!isLoaded || !isEnabled) return null;

  return <Outlet />;
};

export default FeatureGuard;
