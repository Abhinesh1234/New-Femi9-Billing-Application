

import CommonUiPageHeader from "../../../../components/commonUiPageHeader/commonUiPageHeader";
import Footer from "../../../../components/footer/footer";


const UiRatio = () => {
  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
         <CommonUiPageHeader
            title="Ratio Video"
            breadcrumbs={[
              { label: "Home", path: "/dashboard/deals-dashboard" },
              { label: "Base UI" },
              { label: "Ratio Video", active: true },
            ]}
          />

          {/* End Page Header */}
          {/* start row */}
          <div className="row">
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Responsive Ratio video 21:9</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Use class <code>.ratio-21x9</code>
                    {/* 21:9 aspect ratio */}
                  </p>
                  <div className="ratio ratio-21x9">
                    <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Responsive Ratio video 1:1</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Use class <code>.ratio-1x1</code>
                  </p>
                  {/* 1:1 aspect ratio */}
                  <div className="ratio ratio-1x1">
                    <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
            <div className="col-xl-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Responsive Ratio video 16:9</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Use class <code>.ratio-16x9</code>
                  </p>
                  {/* 16:9 aspect ratio */}
                  <div className="ratio ratio-16x9">
                    <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Responsive Ratio video 4:3</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Use class <code>.ratio-4x3</code>
                  </p>
                  {/* 4:3 aspect ratio */}
                  <div className="ratio ratio-4x3">
                    <iframe src="https://www.youtube.com/embed/6bzTrChjEdc?autohide=0&showinfo=0&controls=0" />
                  </div>
                </div>
                {/* end card body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
          {/* end row */}
        </div>
        {/* End Content */}
        {/* Start Footer */}
       <Footer/>
        {/* End Footer */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default UiRatio;
