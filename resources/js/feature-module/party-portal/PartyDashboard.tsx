import { useSelector } from "react-redux";
import type { RootState } from "../../core/redux/store";

const PartyDashboard = () => {
  const { user } = useSelector((state: RootState) => state.partyAuth);

  return (
    <div>
      <div className="mb-4">
        <h4 className="mb-1">Welcome, {user?.name ?? "Guest"}</h4>
        {user?.party_name && (
          <p className="text-muted mb-0 fs-14">
            {user.party_name}
            {user.category_name && ` · ${user.category_name}`}
          </p>
        )}
      </div>

      <div
        className="card"
        style={{ border: "1px solid #dee2e6", borderRadius: 8 }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <i className="ti ti-layout-dashboard" style={{ fontSize: 32, color: "#E41F07" }} />
            <div>
              <div className="fw-semibold fs-15">Party Portal</div>
              <div className="fs-13 text-muted mt-1">
                Your portal dashboard. Module pages will appear here as they are built.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyDashboard;
