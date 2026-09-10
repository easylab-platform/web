<script lang="ts">
  // Sandbox job console: exercises the easylab SandboxService surface from the
  // browser. Lists sandboxes + jobs, streams live output via WatchJob, and
  // lets you run/kill commands.
  //
  // The transport + client are built here: the SDK only ships the generated
  // SandboxService descriptor and message types.
  import { onMount } from 'svelte'
  import { createClient, type Transport } from '@connectrpc/connect'
  import { createConnectTransport } from '@connectrpc/connect-web'
  import { SandboxService } from '@easylab/sdk'
  import type { SandboxInfo } from '@easylab/sdk'
  import type { JobEntry, WatchJobResponse_Done } from '@easylab/sdk/worker'

  const origin =
    (import.meta.env.VITE_EASYLAB_URL as string | undefined) ?? 'http://localhost'
  const token = (import.meta.env.VITE_EASYLAB_TOKEN as string | undefined) ?? ''
  const transport: Transport = createConnectTransport({
    baseUrl: origin.replace(/\/+$/, ''),
    interceptors: token
      ? [next => async req => {
          req.header.set('Authorization', `Bearer ${token}`)
          return await next(req)
        }]
      : [],
  })
  const sandbox = createClient(SandboxService, transport)

  let sandboxes: SandboxInfo[] = []
  let selected = ''
  let jobs: JobEntry[] = []
  let lines: string[] = []
  let running = false
  let done: WatchJobResponse_Done | null = null
  let aborter: AbortController | null = null
  let cmd = 'echo hello sandbox'

  async function refresh() {
    const r = await sandbox.listSandboxes({})
    sandboxes = r.sandboxes ?? []
  }

  async function pick(name: string) {
    selected = name
    lines = []
    done = null
    if (aborter) aborter.abort()
    const r = await sandbox.listJobs({ sandbox: name })
    jobs = r.jobs ?? []
  }

  async function openJob(jobId: string) {
    lines = []
    done = null
    if (aborter) aborter.abort()
    aborter = new AbortController()
    try {
      const stream = sandbox.watchJob({ sandbox: selected, req: { jobId } }, { signal: aborter.signal })
      for await (const ev of stream) {
        if (ev.event.case === 'output') {
          lines = [...lines, (ev.event as { value: string }).value]
        } else if (ev.event.case === 'done') {
          done = (ev.event as { value: WatchJobResponse_Done }).value
          lines = [...lines, `[exit ${done.exitCode}]`]
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') lines = [...lines, `stream error: ${String(e)}`]
    }
  }

  async function run() {
    if (!selected) return
    const r = await sandbox.execute({ sandbox: selected, req: { command: cmd } })
    await openJob(r.jobId)
  }

  async function kill(jobId: string) {
    await sandbox.jobKill({ sandbox: selected, req: { jobId } })
  }

  onMount(refresh)
</script>

<section>
  <h2>Sandboxes</h2>
  <ul>
    {#each sandboxes as sb (sb.name)}
      <li>
        <button on:click={() => pick(sb.name)}>
          {sb.name} · {sb.baseImage} · {sb.runningJobs} running / {sb.totalJobs} jobs
        </button>
      </li>
    {/each}
  </ul>

  {#if selected}
    <h3>Jobs in {selected}</h3>
    <ul>
      {#each jobs as j (j.id)}
        <li>
          <button on:click={() => openJob(j.id)}>{j.command}</button>
          <span>{j.state} (exit {j.exitCode})</span>
          <button on:click={() => kill(j.id)}>kill</button>
        </li>
      {/each}
    </ul>

    <div>
      <input bind:value={cmd} />
      <button on:click={run} disabled={running}>run</button>
    </div>

    {#if lines.length || done}
      <pre>{lines.join('\n')}</pre>
    {/if}
  {/if}
</section>
