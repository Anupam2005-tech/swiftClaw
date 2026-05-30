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
  private timer: NodeJS.Timeout | null = null;
  private baseMessage = "";
  private thinkingCycle = [
    "Analyzing context",
    "Synthesizing information",
    "Processing codebase",
    "Formulating response",
    "Running logic"
  ];
  private cycleIndex = 0;

  start(message: string) {
    this.baseMessage = message;
    this.spin.start(message);
    this.startTimer();
  }

  update(message: string) {
    this.baseMessage = message;
    this.spin.message(message);
    this.startTimer();
  }

  private startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.cycleIndex = 0;
    
    // Only cycle if it's a generic thinking message
    const isThinking = this.baseMessage.toLowerCase().includes("thinking") || 
                       this.baseMessage.toLowerCase().includes("refining");
                       
    this.timer = setInterval(() => {
      if (isThinking) {
        this.cycleIndex = (this.cycleIndex + 1) % this.thinkingCycle.length;
        this.spin.message(`${this.thinkingCycle[this.cycleIndex]}...`);
      } else {
        // Just add animating dots
        this.cycleIndex = (this.cycleIndex + 1) % 4;
        const cleanBase = this.baseMessage.replace(/\.+$/, "");
        this.spin.message(`${cleanBase}${".".repeat(this.cycleIndex)}`);
      }
    }, 2000);
  }

  stop(message?: string) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.spin.stop(message || "Done");
  }

  fail(message?: string) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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
  private cycleTimer: NodeJS.Timeout | null = null;
  private baseMessage = "";
  private thinkingCycle = [
    "Analyzing context",
    "Synthesizing information",
    "Processing codebase",
    "Formulating response",
    "Running logic"
  ];
  private cycleIndex = 0;

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
  
  private startCycle() {
    if (this.cycleTimer) clearInterval(this.cycleTimer);
    this.cycleIndex = 0;
    
    const isThinking = this.baseMessage.toLowerCase().includes("thinking") || 
                       this.baseMessage.toLowerCase().includes("refining");
                       
    this.cycleTimer = setInterval(() => {
      if (isThinking) {
        this.cycleIndex = (this.cycleIndex + 1) % this.thinkingCycle.length;
        this.scheduleUpdate(`⚙️ ${this.thinkingCycle[this.cycleIndex]}...`);
      } else {
        this.cycleIndex = (this.cycleIndex + 1) % 4;
        const cleanBase = this.baseMessage.replace(/\.+$/, "");
        this.scheduleUpdate(`⚙️ ${cleanBase}${".".repeat(this.cycleIndex)}`);
      }
    }, 4000); // Every 4s for telegram
  }

  start(message: string) {
    this.baseMessage = message;
    this.scheduleUpdate(`⚙️ ${message}`);
    this.startCycle();
  }

  update(message: string) {
    this.baseMessage = message;
    this.scheduleUpdate(`⚙️ ${message}`);
    this.startCycle();
  }

  stop(message?: string) {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
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
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
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
