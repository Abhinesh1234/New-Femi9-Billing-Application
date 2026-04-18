import React from "react";

type BreadcrumbItem = {
  label: string;
  path?: string;
  active?: boolean;
};

type CommonPageHeaderProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
};

const CommonUiPageHeader: React.FC<CommonPageHeaderProps> = ({ title, breadcrumbs }) => {
  return (
    <div className="mb-4">
      <h4 className="mb-1">{title}</h4>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0 p-0">
          {breadcrumbs.map((item, index) => (
            <li
              key={index}
              className={`breadcrumb-item ${item.active ? "active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              {item.path && !item.active ? (
                <a href={item.path}>{item.label}</a>
              ) : (
                item.label
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default CommonUiPageHeader;
