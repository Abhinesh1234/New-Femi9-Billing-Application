import { message } from "antd";
import CommonUiPageHeader from "../../../../../components/commonUiPageHeader/commonUiPageHeader";
import Dragger from "antd/es/upload/Dragger";
import { Footer } from "antd/es/layout/layout";


const FileUploadPage = () => {
  const uploadProps = {
    name: "file",
    multiple: true,
    showUploadList: true,
    action: "/", // Set your upload endpoint here
    onChange(info: { file: { name?: any; status?: any; }; fileList: any; }) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e: { dataTransfer: { files: any; }; }) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <div className="page-wrapper">
      {/* Start Content */}
      <div className="content">
        {/* Page Header */}
        <CommonUiPageHeader
          title="File Uploads"
          breadcrumbs={[
            { label: "Home", path: "/dashboard/deals-dashboard" },
            { label: "Base UI" },
            { label: "File Uploads", active: true },
          ]}
        />

        {/* Card Section */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Dropzone File Upload</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">
              DropzoneJS is an open source library that provides drag’n’drop file uploads with image previews.
            </p>

            <Dragger {...uploadProps}>
              <p className="ti ti-cloud-upload h1 text-muted"></p>
              <h3 className="ant-upload-text">
                Drop files here or click to upload.
              </h3>
              <p className="ant-upload-hint text-muted fs-13">
                (This is just a demo dropzone. Selected files are not actually uploaded.)
              </p>
            </Dragger>
          </div>
        </div>
        {/* End Card */}
      </div>
      {/* End Content */}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FileUploadPage;
