# API Architecture

Base URL:

```text
http://127.0.0.1:4173
```

## Public Frontend APIs

### POST `/api.php`

Compatibility endpoint used by the existing frontend card modal.

Request:

```json
{
  "action": "verify",
  "code": "DEMO-2026-LENS-0001",
  "device_hash": "browser-device-hash"
}
```

Actions:

- `verify`: check whether a card is available.
- `use`: increment card usage after a successful export.

### GET `/api/capabilities`

Returns backend image-processing capabilities, including HEIF read/write status and ExifTool version.

### POST `/api/process`

Multipart image-processing endpoint.

Fields:

- `image`: uploaded file.
- `code`: valid card code.
- `device_hash`: browser-generated device id.
- `format`: `jpeg`, `same`, or `heif`.
- `meta`: JSON string containing EXIF and resize options.

Response:

- Binary image output.
- `X-File-Name`
- `X-Image-Width`
- `X-Image-Height`

## Admin APIs

All admin endpoints require:

```text
x-admin-token: LENS-ADMIN-2026
```

Use `ADMIN_TOKEN=your-secret node server.js` in production.

### GET `/api/admin/status`

Backend status, runtime capabilities, and summary counts.

### GET `/api/admin/cards`

List cards with computed status.

### POST `/api/admin/cards`

Create one card.

```json
{
  "code": "OPTIONAL-CUSTOM-CODE",
  "maxUses": 1,
  "expiresAt": "2026-12-31T23:59",
  "note": "customer or channel"
}
```

### POST `/api/admin/cards/generate`

Generate multiple random cards.

```json
{
  "count": 10,
  "prefix": "LENS",
  "maxUses": 1,
  "expiresAt": "",
  "note": "batch"
}
```

### PATCH `/api/admin/cards/:id`

Update card status, usage limit, expiry, or note.

```json
{
  "active": false,
  "maxUses": 3,
  "expiresAt": "",
  "note": "updated"
}
```

### DELETE `/api/admin/cards/:id`

Delete a card.

### GET `/api/admin/logs`

List the newest 500 backend events.

### POST `/api/admin/logs/clear`

Clear logs.
