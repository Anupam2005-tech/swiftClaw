import { spinner } from "@clack/prompts";
import { Context } from "telegraf";

export interface ActionTracker {
  start(message: string): void;
  update(message: string): void;
  stop(message?: string): void;
  fail(message?: string): void;
}

export class CliActionTracker implements ActionTracker {
  private spin = spinner();

  start(message: string) {
    this.spin.start(message);
  }

  update(message: string) {
    this.spin.message(message);
  }

  stop(message?: string) {
    this.spin.stop(message || "Done");
  }

  fail(message?: string) {
    this.spin.stop(message || "Failed");
  }
}

export class TelegramActionTracker implements ActionTracker {
  private ctx: Context;
  private messageId: number | null = null;
  private lastUpdate: number = 0;
  private updateDebounceMs = 1500; // Telegram rate limit mitigation
  private pendingMessage: string | null = null;
  private timeoutId: any = null;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  private async sendMessage(msg: string) {
    if (!this.messageId) {
      try {
        const reply = await this.ctx.reply(msg);
        this.messageId = reply.message_id;
        this.lastUpdate = Date.now();
      } catch (e) {
        console.error("Failed to send status msg:", e);
      }
    } else {
      try {
        await this.ctx.telegram.editMessageText(
          this.ctx.chat?.id,
          this.messageId,
          undefined,
          msg
        );
        this.lastUpdate = Date.now();
      } catch (e) {
        // ignore errors like message is not modified
      }
    }
  }

  private scheduleUpdate(msg: string) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.pendingMessage = msg;
    const now = Date.now();
    const timeSinceLast = now - this.lastUpdate;
    if (timeSinceLast >= this.updateDebounceMs) {
      this.flushUpdate();
    } else {
      this.timeoutId = setTimeout(() => this.flushUpdate(), this.updateDebounceMs - timeSinceLast);
    }
  }

  private flushUpdate() {
    if (this.pendingMessage) {
      this.sendMessage(this.pendingMessage);
      this.pendingMessage = null;
    }
  }

  start(message: string) {
    this.scheduleUpdate(`⚙️ ${message}`);
  }

  update(message: string) {
    this.scheduleUpdate(`⚙️ ${message}`);
  }

  stop(message?: string) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (message) {
      this.sendMessage(`✅ ${message}`);
    } else if (this.messageId) {
      this.sendMessage(`✅ Done`);
    }
  }

  fail(message?: string) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (message) {
      this.sendMessage(`❌ ${message}`);
    } else {
      this.sendMessage(`❌ Failed`);
    }
  }
}

export class NoopActionTracker implements ActionTracker {
  start(message: string) {}
  update(message: string) {}
  stop(message?: string) {}
  fail(message?: string) {}
}
