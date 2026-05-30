import { Modal } from "react-bootstrap";
import AddNewParty from "./addNewParty";

interface AddPartyModalProps {
  onClose: () => void;
  onSaved: (id: number, name: string) => void;
  prefillQuery?: string;
}

const AddPartyModal = ({ onClose, onSaved, prefillQuery }: AddPartyModalProps) => {
  return (
    <Modal
      show
      onHide={onClose}
      centered
      size="xl"
      backdropClassName="blurred-backdrop"
      scrollable
    >
      <Modal.Header
        closeButton={false}
        style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-users fs-18" style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#0f172a" }}>Add New Party</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}
        >
          <i className="ti ti-x" style={{ fontSize: 14, color: "#ef4444", lineHeight: 1 }} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-0">
        <AddNewParty
          modalMode
          onModalClose={onClose}
          onModalSaved={onSaved}
          prefillQuery={prefillQuery}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AddPartyModal;
