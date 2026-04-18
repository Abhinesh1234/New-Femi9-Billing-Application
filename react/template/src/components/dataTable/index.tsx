// index.tsx
import React, { useEffect, useState, useRef } from "react";
import { Pagination, Select, Table } from "antd";
import type { DatatableProps } from "../../core/data/interface";

const { Option } = Select;

const Datatable: React.FC<DatatableProps> = ({
  columns,
  dataSource,
  Selection,
  searchText,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [Selections, setSelections] = useState<any>(true);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  // Debounce searchText
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms debounce
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchText]);

  useEffect(() => {
    setSelections(Selection);
  }, [Selection]);

  useEffect(() => {
    const filteredData = dataSource.filter((record) =>
      Object.values(record).some((field) =>
        String(field).toLowerCase().includes(debouncedSearchText.toLowerCase())
      )
    );
    setFilteredDataSource(filteredData);
    setCurrent(1); // Reset to first page on search
  }, [debouncedSearchText, dataSource]);

  const onSelectChange = (newSelectedRowKeys: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  return (
        <div className="row align-items-center mb-3">
           {/* Table */}
      <Table
        className="table-nowrap mt-3 mb-3"
        rowSelection={Selections ? rowSelection : undefined}
        columns={columns}
        rowHoverable={false}
        dataSource={filteredDataSource.slice((current - 1) * pageSize, current * pageSize)}
        pagination={false} // disable built-in pagination
      />
      {/* Left side: show entries */}
      <div className="col-md-6">
        <div className="datatable-length">
          <label>
            Show
            <Select
              value={pageSize}
              onChange={(value) => handlePageChange(1, value)} // reset to page 1
              style={{ width: 70, margin: '0 8px' }}
              size="small"
            >
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
            entries
          </label>
        </div>
      </div>

      {/* Right side: pagination */}
      <div className="col-md-6 d-flex justify-content-end">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={filteredDataSource.length}
          onChange={handlePageChange}
          size="small"
          showSizeChanger={false}
          itemRender={(_page, type, originalElement) => {
            if (type === 'prev') {
              return <a><i className="ti ti-chevron-left" /></a>;
            }
            if (type === 'next') {
              return <a><i className="ti ti-chevron-right" /></a>;
            }
            return originalElement;
          }}
        />
      </div>

     
    </div>
  );
};

export default Datatable;
