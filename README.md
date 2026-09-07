# easylab-web

EasyLab web frontend (Svelte 5 + Vite). Talks to the easylab gateway over
Connect (`agent.v1.AgentService` surface via
[@easylab/client-sdk](https://github.com/easylab-platform/easylab-client-sdk-ts));
live session events use the `WatchSession` server-streaming RPC.

```sh
npm install
npm run dev                      # dev server (proxy or same-origin agent)
VITE_EASYLAB_URL=https://easylab.example.com npm run build   # point at a gateway
```

Formerly `packages/ui` of the abc agent; now an independent deployment.
