# Verification — October 27, 2026

- Production React build passed with Vite.
- GitHub Actions run 40514259850 passed build and EC2 deployment.
- Live browser loaded 15 devices and displayed Rashad Abdulbarr's footer credit.
- Searching `  rfaW70q3p1r  ` returned exactly one record, confirming case-insensitive matching and trimming.
- Combining that query with Enrolled returned zero records; All plus clearing search restored 15.
- The edit dialog opened with the selected device's saved fields; Cancel did not write changes.
- Direct database audit found 15 records and no normalized duplicate serials before deployment.
- Verified a unique `serial` database index exists after deployment.
- POST with a lowercase, padded existing serial returned HTTP 409 and the expected message.
- PUT attempting another device's lowercase serial returned HTTP 409.
- The database count remained 15 and the conflicting update left the original serial unchanged.
- Atlas screenshot was captured from the signed-in Data Explorer, showing the same 15 inventory records.

These checks do not assert full production security or comprehensive CRUD regression coverage. No original inventory record was deleted or changed during the duplicate tests. AWS console screenshots confirm a running FleetDesk instance and the matching Route 53 A record.

- Final form-feedback build and deployment passed: [run 40514676294](https://github.com/demo18c/fleetdesk/actions/runs/40514676294).
- Live add-device form displayed the HTTP 409 duplicate message inside the modal; canceled afterward without creating a record.
- Search also verified assignee `warehouse`, platform `wear os`, device name `iphone`, and a no-match query.
