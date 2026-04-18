import { PermissionListData } from "../../../../core/json/permissionListData";
import Footer from "../../../../components/footer/footer";
import PageHeader from "../../../../components/page-header/pageHeader";
import Datatable from "../../../../components/dataTable";

const Permission = () => {
  const data = PermissionListData;
  const columns = [
    {
      title: "Modules",
      dataIndex: "Modules",
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "sub Modules",
      dataIndex: "sub_Modules",

      sorter: (a: any, b: any) => a.sub_Modules.length - b.sub_Modules.length,
    },
    {
      title: "Create",
      dataIndex: "Create",
      render: () => (
        <input className="form-check-input" type="checkbox"></input>
      ),
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Edit",
      dataIndex: "Edit",
      render: () => (
        <input className="form-check-input" type="checkbox"></input>
      ),
      sorter: (a: any, b: any) => a.Edit.length - b.Edit.length,
    },
    {
      title: "View",
      dataIndex: "View",
      render: () => (
        <input className="form-check-input" type="checkbox"></input>
      ),
      sorter: (a: any, b: any) => a.View.length - b.View.length,
    },
    {
      title: "Delete",
      dataIndex: "Delete",
      render: () => (
        <input className="form-check-input" type="checkbox"></input>
      ),
      sorter: (a: any, b: any) => a.Delete.length - b.Delete.length,
    },
    {
      title: "Allow All",
      dataIndex: "Allow_All",
      render: () => (
        <input className="form-check-input" type="checkbox"></input>
      ),
      sorter: (a: any, b: any) => a.Allow_All.length - b.Allow_All.length,
    },
  ];

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          {/* Page Header */}
          <PageHeader
            title="Permission"
            badgeCount={152}
            showModuleTile={false}
            showExport={true}
          />
          {/* End Page Header */}
          {/* card start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <h6 className="mb-0">
                Role Name : <span className="text-danger">Admin</span>
              </h6>
              <div className="form-check mb-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="select-all-2"
                />
                <label className="form-check-label" htmlFor="select-all-2">
                  Allow All Modules
                </label>
              </div>
            </div>
            <div className="card-body">
              {/* Contact List */}
              <div className="custom-table">
                <Datatable
                  columns={columns}
                  dataSource={data}
                  Selection={true}
                  searchText=""
                />
              </div>

              {/* /Contact List */}
            </div>
          </div>
          {/* card end */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
        <Footer />
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default Permission;
