import type { ApiClient } from "./viewer/api/client";
import {
  waitForImportJob,
  type ImportWaitOptions,
} from "./viewer/api/importJobs";

// Preserve the existing page/preview retry contract through the shared observer.
export { ImportJobFailedError as WorkspaceImportFailedError } from "./viewer/api/importJobs";

export async function waitForWorkspaceImport(
  client: ApiClient,
  jobId: string,
  options: ImportWaitOptions = {},
): Promise<string> {
  return (await waitForImportJob(client, jobId, options)).result.id;
}
