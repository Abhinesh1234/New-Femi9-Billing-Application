

const HeaderSearchmodal = () => {
  return (
    <>
  {/* Search Modal */}
  <div className="modal fade" id="searchModal">
    <div className="modal-dialog modal-lg">
      <div className="modal-content bg-transparent">
        <div className="card shadow-none mb-0">
          <div
            className="px-3 py-2 d-flex flex-row align-items-center"
            id="search-top"
          >
            <i className="ti ti-search fs-22" />
            <input
              type="search"
              className="form-control border-0"
              placeholder="Search"
            />
            <button
              type="button"
              className="btn p-0"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x fs-22" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</>

  )
}

export default HeaderSearchmodal