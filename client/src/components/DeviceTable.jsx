// ============================================================
// client/src/components/DeviceTable.jsx — the device list
// Pure presentational component: renders whatever `devices` it is given
// and reports user actions (edit / delete / status change) upward.
// ============================================================
import { Badge, Button, Form, Table } from 'react-bootstrap';

// Human-readable platform labels for the badge.
const PLATFORM_LABEL = { android: 'Android', ios: 'iOS', wearos: 'Wear OS', windows: 'Windows' };

// Format an ISO date string for the "Added" column.
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// Props:
//   devices  – array of device objects to show (already filtered by App)
//   onEdit   – (device) => void, opens the modal in edit mode
//   onDelete – (device) => void, asks for confirmation then deletes
//   onStatus – (device, newStatus) => void, inline status update
export default function DeviceTable({ devices, onEdit, onDelete, onStatus }) {
  // Empty state instead of a headerless table.
  if (devices.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">▣</div>
        <div className="fw-semibold">No devices in this view</div>
        <div>Click "+ Add device" to enroll your first one.</div>
      </div>
    );
  }

  return (
    <Table hover responsive className="align-middle">
      <thead>
        <tr>
          <th>Device</th>
          <th>Platform</th>
          <th>OS</th>
          <th style={{ width: 150 }}>Status</th>
          <th>Assigned to</th>
          <th>Added</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          // Retired devices are greyed out.
          <tr key={device._id} className={device.status === 'retired' ? 'text-muted' : ''}>
            <td>
              <div className="fw-semibold">{device.name}</div>
              <small className="text-secondary font-monospace">{device.serial}</small>
            </td>
            <td>
              {/* Soft tinted pill; colour class comes from styles.css */}
              <Badge bg="" className={`platform platform-${device.platform}`}>
                {PLATFORM_LABEL[device.platform] || device.platform}
              </Badge>
            </td>
            <td>{device.osVersion || '—'}</td>
            <td>
              {/* Changing this select fires a PUT immediately (no Save button needed) */}
              <Form.Select
                size="sm"
                className={`status-select ${device.status}`}
                value={device.status}
                onChange={(e) => onStatus(device, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="enrolled">Enrolled</option>
                <option value="retired">Retired</option>
              </Form.Select>
            </td>
            <td>{device.assignedTo || <span className="text-secondary">Unassigned</span>}</td>
            <td>{fmtDate(device.createdAt)}</td>
            <td className="text-end text-nowrap">
              <Button size="sm" variant="outline-primary" className="me-2" onClick={() => onEdit(device)}>
                Edit
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => onDelete(device)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
