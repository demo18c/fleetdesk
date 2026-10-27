// ============================================================
// client/src/components/DeviceModal.jsx — add / edit form in a modal
// One component serves both cases. If `device` has an _id we're editing
// and the form is pre-filled; otherwise it's a blank "add device" form.
// ============================================================
import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';

// Default values for a brand-new device (matches the schema defaults on the server).
const EMPTY = {
  name: '',
  serial: '',
  platform: 'android',
  osVersion: '',
  status: 'pending',
  assignedTo: '',
  notes: '',
};

// Props:
//   show   – boolean, whether the modal is open
//   device – null | {} | device object (see App.jsx `editing` state)
//   onHide – close without saving
//   onSave – (formValues) => void, App decides whether that's a POST or PUT
export default function DeviceModal({ show, device, onHide, onSave, error }) {
  const [form, setForm] = useState(EMPTY);           // controlled form values
  const [validated, setValidated] = useState(false); // turns on Bootstrap's red validation styling
  const isEdit = Boolean(device?._id);

  // Each time the modal opens, reset validation and load the right initial values.
  useEffect(() => {
    if (!show) return;
    setValidated(false);
    setForm(device?._id ? { ...EMPTY, ...device } : EMPTY);
  }, [show, device]);

  // Curried change handler: set('name') returns an onChange for the name field.
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Client-side check for the required fields, then hand the clean values up.
  // Only the schema fields are sent (not _id, createdAt, etc.).
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serial.trim()) {
      setValidated(true);
      return;
    }
    const { name, serial, platform, osVersion, status, assignedTo, notes } = form;
    onSave({
      name: name.trim(),
      serial: serial.trim().toUpperCase(),
      platform,
      osVersion: osVersion.trim(),
      status,
      assignedTo: assignedTo.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      {/* noValidate disables the browser's own popups so Bootstrap's styling shows instead */}
      <Form noValidate validated={validated} onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit device' : 'Add device'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
          <Row>
            <Form.Group as={Col} md={7} className="mb-3" controlId="name">
              <Form.Label>Device name</Form.Label>
              <Form.Control
                required
                autoFocus
                placeholder="Galaxy Tab Active5"
                value={form.name}
                onChange={set('name')}
                maxLength={80}
              />
              <Form.Control.Feedback type="invalid">Device name is required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md={5} className="mb-3" controlId="serial">
              <Form.Label>Serial</Form.Label>
              <Form.Control
                required
                placeholder="R52X1234ABC"
                className="font-monospace"
                value={form.serial}
                onChange={set('serial')}
                maxLength={64}
              />
              <Form.Control.Feedback type="invalid">Serial is required.</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} md={4} className="mb-3" controlId="platform">
              <Form.Label>Platform</Form.Label>
              <Form.Select value={form.platform} onChange={set('platform')}>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="wearos">Wear OS</option>
                <option value="windows">Windows</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={4} className="mb-3" controlId="osVersion">
              <Form.Label>OS version</Form.Label>
              <Form.Control placeholder="14" value={form.osVersion} onChange={set('osVersion')} maxLength={32} />
            </Form.Group>
            <Form.Group as={Col} md={4} className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={set('status')}>
                <option value="pending">Pending</option>
                <option value="enrolled">Enrolled</option>
                <option value="retired">Retired</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="assignedTo">
            <Form.Label>Assigned to</Form.Label>
            <Form.Control placeholder="Name or team" value={form.assignedTo} onChange={set('assignedTo')} maxLength={80} />
          </Form.Group>
          <Form.Group controlId="notes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.notes} onChange={set('notes')} maxLength={1000} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary">{isEdit ? 'Save changes' : 'Add device'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
