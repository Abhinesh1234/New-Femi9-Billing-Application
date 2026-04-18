import { useEffect, useState } from "react";
import { Link } from "react-router";

const CollapseIcons = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initialize Bootstrap tooltips
    // @ts-ignore
    if (window.bootstrap) {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        // @ts-ignore
        new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }, []);

  const handleCollapseToggle = () => {
    const body = document.body;

    if (isCollapsed) {
      body.classList.remove("header-collapse");
    } else {
      body.classList.add("header-collapse");
    }

    setIsCollapsed(!isCollapsed);
  };
  return (
    <>
      <Link
        to="#"
        className="btn btn-icon btn-outline-light shadow"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        data-bs-title="Refresh"
        aria-label="Refresh"
      >
        <i className="ti ti-refresh" />
      </Link>

      <Link
        to="#"
        id="collapse-header"
        onClick={handleCollapseToggle}
        className={`btn btn-icon btn-outline-light shadow ${
          isCollapsed === true ? "active" : ""
        }`}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        data-bs-title={isCollapsed ? "Expand" : "Collapse"}
        aria-label="Collapse"
      >
        <i className="ti ti-transition-top" />
      </Link>
    </>
  );
};

export default CollapseIcons;
