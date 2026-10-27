# FleetDesk — User Stories

FleetDesk is a device fleet inventory for a small IT or field-support team. Each story below
maps to a feature in the app and to an API endpoint on the server.

| ID | As a… | I want to… | So that… | Acceptance criteria |
|----|-------|------------|----------|---------------------|
| US-01 | fleet admin | see every device in the inventory on one page | I know what hardware we have and its state at a glance | Page loads the full list from `GET /api/devices`; summary cards show total / pending / enrolled / retired counts |
| US-02 | fleet admin | add a new device with its name, serial, platform, OS version, status, and assignee | new hardware is tracked from the moment it arrives | "+ Add device" opens a form; name and serial are required; submit calls `POST /api/devices`; the new row appears without a page reload |
| US-03 | fleet admin | edit any field on an existing device | records stay accurate when a device is reassigned or upgraded | Each row has an Edit button that opens the form pre-filled; saving calls `PUT /api/devices/:id` and updates the row in place |
| US-04 | fleet admin | change a device's status directly from the list | moving a device from pending → enrolled → retired is one click | Status is a dropdown in each row; changing it calls `PUT /api/devices/:id` immediately and updates the summary cards |
| US-05 | fleet admin | remove a device that is no longer in the fleet | the inventory only shows real hardware | Delete button asks for confirmation, then calls `DELETE /api/devices/:id` and removes the row |
| US-06 | fleet admin | filter the list by status | I can focus on devices that still need enrollment or have been retired | All / Pending / Enrolled / Retired buttons filter the table client-side; the "Showing x of y" count updates |
| US-07 | fleet admin | use the app from a phone or tablet in the field | I can update a device's status while standing next to it | Layout is responsive (Bootstrap grid); the table scrolls horizontally on narrow screens |
| US-08 | fleet admin | know when something goes wrong | I don't assume a change saved when it didn't | API errors (validation, network) surface in a dismissible alert at the top of the page |

| US-09 | fleet admin | search by name, serial, assignee, platform, or OS | I can quickly locate a device | Search ignores case and surrounding whitespace; combines with status filters; clearing it restores the status-filtered list |
| US-10 | fleet admin | prevent duplicate serial numbers | one physical device has one inventory record | Serial values are trimmed and uppercased; a MongoDB unique index rejects conflicting POST and PUT requests with HTTP 409; existing records stay unchanged |

## Non-functional requirements

- Hosted at a public HTTPS URL on AWS (EC2 + Caddy + Let's Encrypt).
- Data persisted in MongoDB Atlas; the `devices` collection is the single source of truth.
- Only the web app's own origin may call the API (CORS restricted via `CLIENT_ORIGIN`).
- Every push to `main` deploys automatically through GitHub Actions.
- No secrets in source control; the connection string lives in a `.env` file on the server only.
