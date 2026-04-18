// Create this new file or add to your main layout
// filepath: d:\Dreams Projects\dleohr\react\src\feature-module\routes\DynamicTitle.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { publicRoutes, authRoutes } from "./router.link";

type RouteWithMeta = {
  path: string;
  element: React.ReactElement;
  route: (_props: any) => React.ReactElement | null;
  meta_title?: string;
};

const allRoutes: RouteWithMeta[] = [...publicRoutes, ...authRoutes];

export default function DynamicTitle() {
  const location = useLocation();

  useEffect(() => {
  const currentRoute = allRoutes.find(
    (route) => route.path === location.pathname
  );

  const baseTitle = "CRMS - Advanced Bootstrap 5 Admin Template for Customer Management";

  if (currentRoute && currentRoute.meta_title) {
    // Check if meta_title already includes "Dreams Estate"
    if (currentRoute.meta_title.includes(baseTitle)) {
      document.title = currentRoute.meta_title;
    } else {
      document.title = `${currentRoute.meta_title} | ${baseTitle}`;
    }
  } else {
    document.title = baseTitle;
  }
}, [location]);

  return null;
}