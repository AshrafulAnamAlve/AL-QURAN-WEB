import { app, BrowserWindow, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

const DEFAULT_STATE: WindowState = {
  width: 1240,
  height: 820,
  isMaximized: false,
};

export class WindowStateManager {
  private stateFilePath: string;
  private state: WindowState;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.stateFilePath = path.join(app.getPath('userData'), 'window-state.json');
    this.state = this.loadState();
  }

  getState(): WindowState {
    return this.state;
  }

  manage(win: BrowserWindow): void {
    if (this.state.isMaximized) {
      win.maximize();
    }

    const updateState = () => {
      if (!win || win.isDestroyed()) return;

      try {
        const isMaximized = win.isMaximized();
        if (!isMaximized) {
          const bounds = win.getBounds();
          this.state.width = bounds.width;
          this.state.height = bounds.height;
          this.state.x = bounds.x;
          this.state.y = bounds.y;
        }
        this.state.isMaximized = isMaximized;
        this.debounceSave();
      } catch {
        // Ignored if window closing
      }
    };

    win.on('resize', updateState);
    win.on('move', updateState);
    win.on('close', updateState);
  }

  private loadState(): WindowState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf8');
        const parsed = JSON.parse(raw) as WindowState;

        // Verify that saved coordinates are visible on at least one current display
        if (parsed.x !== undefined && parsed.y !== undefined) {
          const visible = screen.getAllDisplays().some((display) => {
            const b = display.bounds;
            return (
              parsed.x! >= b.x &&
              parsed.x! < b.x + b.width &&
              parsed.y! >= b.y &&
              parsed.y! < b.y + b.height
            );
          });

          if (!visible) {
            delete parsed.x;
            delete parsed.y;
          }
        }

        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // Return default on error
    }
    return { ...DEFAULT_STATE };
  }

  private debounceSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf8');
      } catch {
        // Ignored
      }
    }, 500);
  }
}
