# E2E Tests

The E2E suite uses Playwright against the development test environment.

Required environment variables:

- `E2E_BASE_URL`: base URL of the development test frontend, for example `https://example.com`
- `E2E_USERNAME`: stable test account username
- `E2E_PASSWORD`: stable test account password

Run locally:

```bash
E2E_BASE_URL=https://example.com \
E2E_USERNAME=test-user \
E2E_PASSWORD=test-password \
yarn test:e2e
```

The CI workflow reads the same values from GitHub Actions secrets.
