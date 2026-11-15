# FleetDesk interface wireframes

These wireframes document the layout of the implemented desktop interface.

## Device inventory

```text
+------------------------------------------------------------------+
| FleetDesk                                           [Add device] |
+------------------------------------------------------------------+
| [Total devices]     [Pending]     [Enrolled]       [Retired]      |
| Search devices [ Name, serial, assignee, platform, or OS        ] |
| [All] [Pending] [Enrolled] [Retired]               Showing X of Y |
+------------------------------------------------------------------+
| Device       Platform   OS   Status       Assigned to  Actions   |
| Name/serial  Android    15   [Enrolled v] Warehouse    Edit Delete|
+------------------------------------------------------------------+
| Created by Rashad Abdulbarr                                      |
+------------------------------------------------------------------+
```

Search and status filters can be used together. Use the status dropdown
for a quick update. Delete opens a confirmation prompt.

## Add or edit a device

```text
+----------------------------------------------------+
| Add device / Edit device                       [X] |
+----------------------------------------------------+
| [Validation or duplicate serial error, if present] |
| Device name [                  ] Serial [        ] |
| Platform    [             v    ] OS     [        ] |
| Status      [             v    ] Assigned to [   ] |
| Notes       [                                    ] |
|                                    [Cancel] [Save] |
+----------------------------------------------------+
```

Edit opens with the saved values. Saving writes the changes through the
device API. Cancel closes the form.
