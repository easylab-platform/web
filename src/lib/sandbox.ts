import type { SandboxInfo } from '@easylab/sdk'
import WorkerConsole from './WorkerConsole.svelte'

/**
 * SandboxPane — the frontend job observability panel for a worker sandbox.
 *
 * Reads the sandbox list via the easylab gateway SandboxService (list +
 * per-sandbox job counts), lets the user drill into a sandbox's job history,
 * and click a job to see the live WatchJob stream (replay + live + done).
 * The WorkerConsole child owns the direct Execute/JobStdin/JobKill face.
 */
export class SandboxPane {
  constructor(
    private list: () => Promise<SandboxInfo[]>,
    private get: (name: string) => Promise<SandboxInfo>,
    private jobs: (name: string) => Promise<unknown[]>,
    private watch: (name: string, jobId: string, signal: AbortSignal) => AsyncIterable<unknown>,
    private output: (name: string, jobId: string, start: number, end: number, stream: string) => Promise<{ lines: string[]; totalLines: number }>,
  ) {}
}

export default WorkerConsole
export type { SandboxInfo }
