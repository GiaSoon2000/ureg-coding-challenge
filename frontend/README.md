# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Proxy and production notes

- The production frontend image includes an nginx config (`frontend/nginx/default.conf`) that proxies API calls to `/rates` over the docker-compose network to the backend service (`backend:5000`). This lets the frontend keep relative API paths (e.g. `/rates`) and mirrors typical production setups.
- During local dev with `npm run dev`, the Vite dev server runs on a different port and you may need to set `VITE` environment variables or configure a proxy in `vite.config.js` to forward `/rates` to `http://localhost:5000`.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
