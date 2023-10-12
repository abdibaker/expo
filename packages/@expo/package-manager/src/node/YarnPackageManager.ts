import { BasePackageManager } from './BasePackageManager';
import { findYarnOrNpmWorkspaceRoot, YARN_LOCK_FILE } from '../utils/nodeWorkspaces';
import { createPendingSpawnAsync } from '../utils/spawn';
import { isYarnOfflineAsync } from '../utils/yarn';

export class YarnPackageManager extends BasePackageManager {
  readonly name = 'yarn';
  readonly bin = 'yarnpkg';
  readonly lockFile = YARN_LOCK_FILE;

  /** Check if Yarn is running in offline mode, and add the `--offline` flag */
  private async withOfflineFlagAsync(namesOrFlags: string[]): Promise<string[]> {
    return (await isYarnOfflineAsync()) ? [...namesOrFlags, '--offline'] : namesOrFlags;
  }

  workspaceRoot() {
    const root = findYarnOrNpmWorkspaceRoot(this.ensureCwdDefined('workspaceRoot'));
    if (root) {
      return new YarnPackageManager({
        ...this.options,
        silent: this.silent,
        log: this.log,
        cwd: root,
      });
    }

    return null;
  }

  runAsync(scriptName: string, argsOrFlags: string[] = []) {
    return this.executeAsync(['run', scriptName, ...argsOrFlags]);
  }

  installAsync(flags: string[] = []) {
    return createPendingSpawnAsync(
      () => this.withOfflineFlagAsync(['install']),
      (args) => this.executeAsync([...args, ...flags])
    );
  }

  addAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return createPendingSpawnAsync(
      () => this.withOfflineFlagAsync(['add', ...namesOrFlags]),
      (args) => this.executeAsync(args)
    );
  }

  addDevAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return createPendingSpawnAsync(
      () => this.withOfflineFlagAsync(['add', '--dev', ...namesOrFlags]),
      (args) => this.executeAsync(args)
    );
  }

  addGlobalAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return createPendingSpawnAsync(
      () => this.withOfflineFlagAsync(['global', 'add', ...namesOrFlags]),
      (args) => this.executeAsync(args)
    );
  }

  removeAsync(namesOrFlags: string[]) {
    return this.executeAsync(['remove', ...namesOrFlags]);
  }

  removeDevAsync(namesOrFlags: string[]) {
    return this.executeAsync(['remove', ...namesOrFlags]);
  }

  removeGlobalAsync(namesOrFlags: string[]) {
    return this.executeAsync(['global', 'remove', ...namesOrFlags]);
  }
}
