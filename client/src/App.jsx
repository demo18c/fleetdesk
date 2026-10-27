// ============================================================
// client/src/App.jsx — root component and single source of truth
// Owns all state (device list, loading, error, filter, modal) and the
// four CRUD handlers. Child components are presentational and get
// data + callbacks via props.
// ============================================================
import { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Navbar, Row, Spinner } from 'react-bootstrap';
import { createDevice, deleteDevice, listDevices, updateDevice } from './api.js';
import DeviceTable from './components/DeviceTable.jsx';
import DeviceModal from './components/DeviceModal.jsx';
import SplashScreen from './components/SplashScreen.jsx';

// How long the launch splash stays up, and how long its fade-out takes.
const SPLASH_MS = 5000;
const SPLASH_FADE_MS = 400;
const SPLASH_KEY = 'fleetdesk:splashSeen';

// sessionStorage can throw in private windows or with storage blocked, so both
// helpers are wrapped: if it fails we just show the splash, which is harmless.
const hasSeenSplash = () => {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
};
const markSplashSeen = () => {
  try {
    sessionStorage.setItem(SPLASH_KEY, '1');
  } catch {
    /* ignore */
  }
};

// Status filter buttons shown above the table.
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'enrolled', label: 'Enrolled' },
  { key: 'retired', label: 'Retired' },
];

export default function App() {
  const [devices, setDevices] = useState([]);    // the list from the server
  const [loading, setLoading] = useState(true);  // true until the first fetch resolves
  const [error, setError] = useState('');        // last error message, shown in an Alert
  const [filter, setFilter] = useState('all');   // which status filter is active
  // Modal state: null = closed, {} = adding a new device, {…device} = editing that device.
  const [editing, setEditing] = useState(null);
  // Splash: 'show' → 'fade' (last 400ms) → 'done' (unmounted). Data loads underneath it.
  // Shown once per browser session: a flag in sessionStorage skips it on refresh and
  // on later visits in the same tab. Closing the tab clears it, so a fresh visit sees it again.
  const [splash, setSplash] = useState(() => (hasSeenSplash() ? 'done' : 'show'));

  // Hold the splash for SPLASH_MS, fade it out, then unmount it.
  useEffect(() => {
    if (splash === 'done') return undefined;
    markSplashSeen();
    const fade = setTimeout(() => setSplash('fade'), SPLASH_MS);
    const done = setTimeout(() => setSplash('done'), SPLASH_MS + SPLASH_FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, []);

  // On first render, load all devices from the API (the "retrieve all records" step).
  useEffect(() => {
    listDevices()
      .then(setDevices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Wrap any async action: clear the old error, run it, capture a new error if thrown.
  // Keeps the try/catch out of each handler below.
  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    }
  };

  // Called by DeviceModal on submit. If we're editing an existing device (has _id)
  // send a PUT and swap it in the list; otherwise POST and prepend the new one.
  // Local state is updated from the server's response, so no refetch is needed.
  const handleSave = (form) =>
    run(async () => {
      if (editing?._id) {
        const updated = await updateDevice(editing._id, form);
        setDevices((d) => d.map((x) => (x._id === updated._id ? updated : x)));
      } else {
        const created = await createDevice(form);
        setDevices((d) => [created, ...d]);
      }
      setEditing(null);
    });

  // Inline status change from the dropdown in the table. Sends only { status }.
  const handleStatus = (device, status) =>
    run(async () => {
      const updated = await updateDevice(device._id, { status });
      setDevices((d) => d.map((x) => (x._id === updated._id ? updated : x)));
    });

  // Delete with a native confirm dialog, then remove from local state.
  const handleDelete = (device) => {
    if (!window.confirm(`Remove "${device.name}" (${device.serial}) from the fleet?`)) return;
    run(async () => {
      await deleteDevice(device._id);
      setDevices((d) => d.filter((x) => x._id !== device._id));
    });
  };

  // Derived values: the filtered list for the table, and per-status counts for the cards.
  const visible = filter === 'all' ? devices : devices.filter((d) => d.status === filter);
  const count = (s) => devices.filter((d) => d.status === s).length;

  return (
    <>
      {/* Launch screen overlay; sits above everything until it fades out */}
      {splash !== 'done' && <SplashScreen fading={splash === 'fade'} duration={SPLASH_MS} />}

      {/* Top bar: brand + the only entry point for adding a device */}
      <Navbar data-bs-theme="dark" className="app-navbar mb-4 py-3">
        <Container>
          <Navbar.Brand className="fw-bold d-flex align-items-center">
            <span className="brand-dot" />
            FleetDesk
          </Navbar.Brand>
          <Button variant="primary" onClick={() => setEditing({})}>
            + Add device
          </Button>
        </Container>
      </Navbar>

      <Container>
        {/* Summary cards: totals per status, derived from the loaded list */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="label">Total devices</div>
              <div className="value">{devices.length}</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card pending">
              <div className="label">Pending</div>
              <div className="value">{count('pending')}</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card enrolled">
              <div className="label">Enrolled</div>
              <div className="value">{count('enrolled')}</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card retired">
              <div className="label">Retired</div>
              <div className="value">{count('retired')}</div>
            </div>
          </Col>
        </Row>

        {/* Filter buttons on the left, count of visible rows on the right */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <ButtonGroup className="filter-group">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant="light"
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </ButtonGroup>
          <small className="text-secondary">
            Showing {visible.length} of {devices.length}
          </small>
        </div>

        {/* Any API error surfaces here; dismissible */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Spinner during the initial load, then the table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="task-card">
            <DeviceTable
              devices={visible}
              onEdit={setEditing}
              onDelete={handleDelete}
              onStatus={handleStatus}
            />
          </div>
        )}

        <footer className="app-footer">
          <div>Created by Rashad Abdulbarr</div>
          <div>FleetDesk · MongoDB · Express · React · Node</div>
        </footer>
      </Container>

      {/* One modal handles both "add" and "edit"; `device` decides which */}
      <DeviceModal
        show={editing !== null}
        device={editing}
        onHide={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
}
