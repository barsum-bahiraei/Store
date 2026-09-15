# Store test deployment

The stack runs Website, Panel, API, PostgreSQL, and MinIO on one server using direct IP ports. PostgreSQL and MinIO data are stored in named Docker volumes.

## Server prerequisites

- Install Docker Engine with the Compose plugin.
- Allow inbound TCP 22, 3000, 3001, 8080, and 9000.
- Add the deployment user to the `docker` group.
- Create the deployment directory and make the deployment user its owner.

Example deployment directory:

```bash
sudo mkdir -p /opt/store
sudo chown "$USER:$USER" /opt/store
```

## GitHub Actions configuration

Create an Actions environment named `production`.

Create these repository-level Actions variables under `Settings > Secrets and variables > Actions > Variables`:

- `SERVER_HOST`: server IP or SSH hostname
- `SERVER_PORT`: usually `22`
- `SERVER_USER`: non-root deployment user
- `DEPLOY_PATH`: usually `/opt/store`
- `WEBSITE_API_BASE_URL`: for example `http://203.0.113.10:8080/api`
- `PANEL_API_BASE_URL`: for example `http://203.0.113.10:8080`
- `PANEL_MINIO_BASE_URL`: for example `http://203.0.113.10:9000`

Environment secrets:

- `SERVER_SSH_KEY`: private key accepted by the server
- `SERVER_KNOWN_HOSTS`: pinned SSH host key line
- `GHCR_USERNAME`: GitHub username owning the packages
- `GHCR_TOKEN`: classic PAT with `read:packages`
- `PRODUCTION_ENV`: full contents based on `.env.example`

Create the secrets under the `production` environment. Generate dotenv-safe application secrets with `openssl rand -hex 32`. If the PostgreSQL volume already contains data, changing `POSTGRES_PASSWORD` in `PRODUCTION_ENV` does not change the existing database role password; rotate that role inside PostgreSQL first.

Generate `SERVER_KNOWN_HOSTS` from a trusted network and verify its fingerprint before saving it:

```bash
ssh-keyscan -p 22 your-server.example.com
```

After the first push, all three workflows run because all deployment files are new. Later pushes only publish the service whose directory changed. Infrastructure changes under `deploy/` intentionally publish all services.

The services are available at:

- Website: `http://SERVER_IP:3000`
- Panel: `http://SERVER_IP:3001`
- API: `http://SERVER_IP:8080`
- API health: `http://SERVER_IP:8080/health`
- MinIO API: `http://SERVER_IP:9000`

This direct-port setup uses plain HTTP and is intended only for initial testing. Add a domain and HTTPS before accepting real user passwords or production traffic.
