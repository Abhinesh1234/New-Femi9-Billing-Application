
import Footer from "../../../components/footer/footer"
import PageHeader from "../../../components/page-header/pageHeader"


const BlankPage = () => {
  return (
   <>
  {/* ========================
			Start Page Content
		========================= */}
  <div className="page-wrapper">
    {/* Start Content */}
    <div className="content">
      {/* Page Header */}
     <PageHeader title="Blank Page" showModuleTile={false} showExport={false} />
      {/* End Page Header */}
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

  )
}

export default BlankPage