# Deploy

This project needs a Node backend, so GitHub Pages alone is not enough.

Recommended setup:

```text
GitHub repo -> Render/Railway/Fly/VPS -> public URL
```

## Environment Variables

```text
PORT=4173
ADMIN_TOKEN=your-strong-admin-token
DATA_DIR=/data
```

`DATA_DIR` stores card codes and logs. Use a persistent disk/volume in production.

## Render

1. Push this folder to a GitHub repository.
2. In Render, create a Blueprint from the repository.
3. Render will read `render.yaml`.
4. Set `ADMIN_TOKEN` in Render's environment settings.
5. Open:

```text
https://your-service.onrender.com/
https://your-service.onrender.com/admin
```

Important: Render free services can sleep. Use a paid/starter instance or another always-on provider if you need it to never go offline.

## Docker

```bash
docker build -t lens-parameters .
docker run -p 4173:4173 \
  -e ADMIN_TOKEN=your-strong-admin-token \
  -v lens-parameters-data:/data \
  lens-parameters
```

## Health Check

```text
/api/health
```
