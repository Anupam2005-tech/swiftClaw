import fs from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import type { AgentConfig, ActionLog } from "./types";
import { ActionTracker } from "./action-tracker";

const TEXT_EXT = new Set([
  "txt",
  "text",
  "md",
  "markdown",
  "mdx",
  "mdwn",
  "rst",
  "adoc",
  "asciidoc",
  "org",
  "tex",
  "bib",
  "msg",
  "log",
  "licence",
  "license",
  "authors",
  "todo",
  "changelog",
  "json",
  "json5",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "env",
  "properties",
  "xml",
  "csv",
  "tsv",
  "inf",
  "plist",
  "lock",
  "html",
  "htm",
  "xhtml",
  "htmlx",
  "css",
  "scss",
  "sass",
  "less",
  "styl",
  "js",
  "jsx",
  "ts",
  "tsx",
  "mjs",
  "cjs",
  "mts",
  "cts",
  "vue",
  "svelte",
  "astro",
  "coffee",
  "litcoffee",
  "py",
  "pyw",
  "pyi",
  "java",
  "kt",
  "kts",
  "scala",
  "groovy",
  "swift",
  "go",
  "rs",
  "c",
  "cpp",
  "cc",
  "cxx",
  "h",
  "hh",
  "hpp",
  "hxx",
  "cs",
  "fs",
  "fsx",
  "sh",
  "bash",
  "zsh",
  "fish",
  "ps1",
  "psm1",
  "psd1",
  "pl",
  "pm",
  "rb",
  "r",
  "bat",
  "cmd",
  "awk",
  "sed",
  "make",
  "makefile",
  "dockerfile",
  "hs",
  "lhs",
  "jl",
  "lua",
  "dart",
  "elm",
  "erl",
  "ex",
  "exs",
  "clj",
  "cljs",
  "edn",
  "lisp",
  "cl",
  "scm",
  "ss",
  "rkt",
  "ml",
  "mli",
  "nim",
  "v",
  "zig",
  "pas",
  "pp",
  "d",
  "sql",
  "gql",
  "graphql",
  "prql",
  "yarnrc",
  "npmrc",
  "eslintignore",
  "prettierrc",
  "editorconfig",
  "code-workspace",
  "gitignore",
  "gitattributes",
  "gitmodules",
  "babelrc",
  "watchmanconfig",
  "flowconfig",
]);

function isProbablyTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, "");
  return TEXT_EXT.has(ext);
}

export interface FileNode {
  path: string;
  type: "file" | "directory";
  size?: number;
}

export interface SearchResult {
  file: string;
  line: number;
  content: string;
}

export class ToolExecutor {
  private overlay = new Map<string, string>();
  private deleted = new Set<string>();

  private readonly norm = (rel: string): string => {
    return path.posix
      .normalize(rel.split(path.sep).join("/"))
      .replace(/^\.\//, "");
  };

  constructor(
    private readonly tracker: ActionTracker,
    private readonly config: AgentConfig,
  ) {}

  private resolveSafe(rel: string): string {
    try {
      const abs = path.resolve(this.config.codebasePath, rel);
      const root = path.resolve(this.config.codebasePath);
      const relCheck = path.relative(root, abs);

      if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) {
        throw new Error(
          `Security Violation: Path escapes workspace boundaries: ${rel}`,
        );
      }
      return abs;
    } catch (error: any) {
      throw new Error(`Path resolution failed for '${rel}': ${error.message}`);
    }
  }

  private excluded(relPath: string): boolean {
    const norm = this.norm(relPath);
    const segments = norm.split("/");
    const base = segments[segments.length - 1] ?? "";

    for (const pat of this.config.excludePatterns || []) {
      if (pat === "*.log" && base.endsWith(".log")) return true;
      if (pat === ".env*" && base.startsWith(".env")) return true;
      if (pat.includes("*")) continue;

      if (
        segments.includes(pat) ||
        norm === pat ||
        norm.startsWith(`${pat}/`)
      ) {
        return true;
      }
    }
    if (segments.includes(".git")) return true;
    return false;
  }

  private assertNotExcluded(rel: string, op: string): void {
    if (this.excluded(rel)) {
      throw new Error(
        `${op} Error: Path is excluded by security/ignore policy: ${rel}`,
      );
    }
  }

  // ==========================================
  // READ OPERATIONS (Overlay Aware)
  // ==========================================

  getEffectiveText(rel: string): string | undefined {
    try {
      const key = this.norm(rel);
      if (this.deleted.has(key)) return undefined;
      if (this.overlay.has(key)) return this.overlay.get(key);

      const abs = this.resolveSafe(rel);
      if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return undefined;
      return fs.readFileSync(abs, "utf8");
    } catch (err) {
      return undefined;
    }
  }

  readFile(rel: string): string {
    this.assertNotExcluded(rel, "read_file");
    const key = this.norm(rel);
    const abs = this.resolveSafe(rel);

    if (this.deleted.has(key)) {
      throw new Error(`read_file: File is staged for deletion: ${rel}`);
    }
    if (this.overlay.has(key)) {
      return this.overlay.get(key)!;
    }

    if (!fs.existsSync(abs))
      throw new Error(`read_file: File not found: ${rel}`);
    const st = fs.statSync(abs);
    if (!st.isFile())
      throw new Error(`read_file: Target is not a file: ${rel}`);

    if (st.size > (this.config.maxFileSizeToRead || 1024 * 1024 * 5)) {
      throw new Error(
        `read_file: File exceeds maximum allowed read size: ${rel}`,
      );
    }

    try {
      const text = fs.readFileSync(abs, "utf8");
      this.tracker.log({
        type: "code_analysis",
        path: key,
        details: { toolName: "read_file" },
        status: "executed",
      });
      return text;
    } catch (e: any) {
      throw new Error(`read_file: IO Error reading file ${rel}: ${e.message}`);
    }
  }

  // ==========================================
  // MUTATION STAGING (No Immediate Disk Writes)
  // ==========================================

  createFile(rel: string, content: string): void {
    this.assertNotExcluded(rel, "create_file");
    const abs = this.resolveSafe(rel);
    const key = this.norm(rel);

    if ((fs.existsSync(abs) && !this.deleted.has(key)) || this.overlay.has(key)) {
      throw new Error(`create_file: File already exists: ${rel}`);
    }

    this.deleted.delete(key);
    this.overlay.set(key, content);

    this.tracker.log({
      type: "file_create",
      path: key,
      details: { toolName: "create_file", content, before: "", after: content },
      status: "pending",
    });
  }

  modifyFile(rel: string, content: string): void {
    this.assertNotExcluded(rel, "modify_file");
    const abs = this.resolveSafe(rel);
    const key = this.norm(rel);

    if (this.deleted.has(key) || (!fs.existsSync(abs) && !this.overlay.has(key))) {
      throw new Error(
        `modify_file: Target is not a valid file or does not exist: ${rel}`,
      );
    }

    const before = this.getEffectiveText(rel) ?? "";

    this.deleted.delete(key);
    this.overlay.set(key, content);

    this.tracker.log({
      type: "file_modify",
      path: key,
      details: { toolName: "modify_file", content, before, after: content },
      status: "pending",
    });
  }

  deleteFile(rel: string): void {
    this.assertNotExcluded(rel, "delete_file");
    const abs = this.resolveSafe(rel);
    const key = this.norm(rel);

    if (this.deleted.has(key) || (!fs.existsSync(abs) && !this.overlay.has(key))) {
      throw new Error(
        `delete_file: Target does not exist or is not a file: ${rel}`,
      );
    }

    const before = this.getEffectiveText(rel) ?? "";

    this.deleted.add(key);
    this.overlay.delete(key);

    this.tracker.log({
      type: "file_delete",
      path: key,
      details: { toolName: "delete_file", before, after: "" },
      status: "pending",
    });
  }

  createFolder(rel: string): void {
    this.assertNotExcluded(rel, "create_folder");
    const abs = this.resolveSafe(rel);

    if (fs.existsSync(abs))
      throw new Error(`create_folder: Path already exists: ${rel}`);

    this.tracker.log({
      type: "folder_create",
      path: this.norm(rel),
      details: { toolName: "create_folder" },
      status: "pending",
    });
  }

  queueShell(
    command: string,
    cwdRel: string = ".",
  ): { stdout: string; stderr: string; status: number | null } {
    this.assertNotExcluded(cwdRel, "queue_shell");
    const key = this.norm(cwdRel);

    this.tracker.log({
      type: "tool_execute",
      path: key,
      details: { command, toolName: "queue_shell" },
      status: "pending",
    });

    return {
      stdout: "Command staged successfully for execution. Pending user approval.",
      stderr: "",
      status: 0,
    };
  }

  executeShellCommand(
    command: string,
    args?: string[],
  ): { stdout: string; stderr: string; status: number | null } {
    const fullCommand =
      args && args.length > 0 ? `${command} ${args.join(" ")}` : command;
    return this.queueShell(fullCommand);
  }

  // ==========================================
  // UTILITIES & CODEBASE LOOKUPS
  // ==========================================

  listDirectory(
    rel: string = ".",
    recursive: boolean = false,
  ): Array<{ name: string; isDirectory: boolean }> {
    this.assertNotExcluded(rel, "list_directory");
    const abs = this.resolveSafe(rel);

    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      throw new Error(
        `list_directory: Target is not a valid directory: ${rel}`,
      );
    }

    try {
      const result: Array<{ name: string; isDirectory: boolean }> = [];

      const traverse = (currentRel: string) => {
        const currentAbs = this.resolveSafe(currentRel);
        const entries = fs.readdirSync(currentAbs, { withFileTypes: true });
        for (const entry of entries) {
          const entryRelPath = path.join(currentRel, entry.name);
          if (!this.excluded(entryRelPath)) {
            const relativeToTarget = path.relative(
              abs,
              this.resolveSafe(entryRelPath),
            );
            result.push({
              name: relativeToTarget,
              isDirectory: entry.isDirectory(),
            });

            if (recursive && entry.isDirectory()) {
              traverse(entryRelPath);
            }
          }
        }
      };

      traverse(rel);
      return result;
    } catch (e: any) {
      throw new Error(
        `list_directory: Failed to read directory ${rel}: ${e.message}`,
      );
    }
  }

  analyzeCodebase(rel: string = "."): FileNode[] {
    this.assertNotExcluded(rel, "analyze_codebase");
    const rootAbs = this.resolveSafe(rel);

    if (!fs.existsSync(rootAbs) || !fs.statSync(rootAbs).isDirectory()) {
      throw new Error(`analyze_codebase: Target must be a directory: ${rel}`);
    }

    const results: FileNode[] = [];
    let fileCount = 0;
    const MAX_FILES = 10000;

    const walk = (currentRel: string) => {
      if (fileCount > MAX_FILES)
        throw new Error(
          `analyze_codebase: Max file limit (${MAX_FILES}) reached. Aborting.`,
        );

      const currentAbs = this.resolveSafe(currentRel);
      let entries;
      try {
        entries = fs.readdirSync(currentAbs, { withFileTypes: true });
      } catch (err: any) {
        return;
      }

      for (const entry of entries) {
        const itemRel = path.join(currentRel, entry.name);
        if (this.excluded(itemRel)) continue;

        if (entry.isDirectory()) {
          results.push({ path: this.norm(itemRel), type: "directory" });
          walk(itemRel);
        } else if (entry.isFile()) {
          fileCount++;
          const stat = fs.statSync(this.resolveSafe(itemRel));
          results.push({
            path: this.norm(itemRel),
            type: "file",
            size: stat.size,
          });
        }
      }
    };

    walk(rel);
    this.tracker.log({
      type: "code_analysis",
      path: this.norm(rel),
      details: { toolName: "analyze_codebase" },
      status: "executed",
    });
    return results;
  }

  searchFiles(
    dirRel: string,
    globPattern: string,
    contentContains?: string,
  ): SearchResult[] {
    this.assertNotExcluded(dirRel, "search_files");
    const rootAbs = this.resolveSafe(dirRel);

    if (!fs.existsSync(rootAbs) || !fs.statSync(rootAbs).isDirectory()) {
      throw new Error(`search_files: Target directory is invalid: ${dirRel}`);
    }

    const matchGlob = (filePath: string, pattern: string): boolean => {
      const useBasename = !pattern.includes("/");
      const target = useBasename ? path.basename(filePath) : filePath;
      const regexStr = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*/g, ".*")
        .replace(/(?<!\.)\*/g, "[^/]*")
        .replace(/\?/g, ".");
      const regex = new RegExp(`^${regexStr}$`, "i");
      return regex.test(target);
    };

    const matches: SearchResult[] = [];
    const filesToScan = this.analyzeCodebase(dirRel).filter(
      (f) => f.type === "file",
    );

    for (const fileNode of filesToScan) {
      if (!matchGlob(fileNode.path, globPattern)) continue;
      if (!isProbablyTextFile(fileNode.path)) continue;

      try {
        const absPath = this.resolveSafe(fileNode.path);
        const content = fs.readFileSync(absPath, "utf8");

        if (contentContains) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(contentContains.toLowerCase())) {
              matches.push({
                file: fileNode.path,
                line: index + 1,
                content: line.trim(),
              });
            }
          });
        } else {
          matches.push({ file: fileNode.path, line: 1, content: "" });
        }
      } catch (err) {
        continue;
      }
    }

    this.tracker.log({
      type: "code_analysis",
      path: this.norm(dirRel),
      details: {
        toolName: "search_files",
        query: `${globPattern} (content: ${contentContains || "none"})`,
      },
      status: "executed",
    });
    return matches;
  }

  // ==========================================
  // SKILLS SYSTEM
  // ==========================================

  skillRoots(): string[] {
    const potentialRoots = [
      path.join(this.config.codebasePath, ".skills"),
      path.join(homedir(), ".agent", "skills"),
    ];

    return potentialRoots.filter((root) => {
      try {
        return fs.existsSync(root) && fs.statSync(root).isDirectory();
      } catch {
        return false;
      }
    });
  }

  listSkills(): string[] {
    const roots = this.skillRoots();
    const availableSkills = new Set<string>();

    for (const root of roots) {
      try {
        const entries = fs.readdirSync(root, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && isProbablyTextFile(entry.name)) {
            availableSkills.add(entry.name);
          }
        }
      } catch (err: any) {
        console.warn(`list_skills: Failed to read skill root ${root}`);
      }
    }

    return Array.from(availableSkills);
  }

  readSkill(skillName: string): string {
    const roots = this.skillRoots();

    for (const root of roots) {
      const skillPath = path.join(root, skillName);
      const relCheck = path.relative(root, skillPath);
      if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) continue;

      if (fs.existsSync(skillPath) && fs.statSync(skillPath).isFile()) {
        try {
          return fs.readFileSync(skillPath, "utf8");
        } catch (err: any) {
          throw new Error(
            `read_skill: IO error reading skill ${skillName}: ${err.message}`,
          );
        }
      }
    }
    throw new Error(
      `read_skill: Skill not found across active roots: ${skillName}`,
    );
  }

  // ==========================================
  // COMMITTING STAGED MUTATIONS ON APPROVAL
  // ==========================================

  applyApprovedFromTracker(): string[] {
    const approvedActions = (this.tracker as any).getApprovedActions?.() as
      | ActionLog[]
      | undefined;

    if (!approvedActions || !Array.isArray(approvedActions)) {
      return [];
    }

    const errors: string[] = [];
    if (approvedActions.length === 0) return errors;

    for (const action of approvedActions) {
      try {
        const abs = this.resolveSafe(action.path);

        switch (action.type) {
          case "file_create":
          case "file_modify": {
            const dir = path.dirname(abs);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(abs, action.details.content ?? "", "utf8");
            break;
          }
          case "file_delete":
            if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
              fs.unlinkSync(abs);
            }
            break;
          case "folder_create":
            if (!fs.existsSync(abs)) {
              fs.mkdirSync(abs, { recursive: true });
            }
            break;
          case "tool_execute": {
            const result = spawnSync(action.details.command ?? "", {
              cwd: abs,
              shell: true,
              encoding: "utf8",
              timeout: 30000,
              maxBuffer: 1024 * 1024 * 5,
            });
            if (result.error) throw result.error;
            break;
          }
          default:
            console.warn(
              `apply_approved: Unsupported action type enqueued: ${action.type}`,
            );
        }

        (this.tracker as any).markApplied?.(action.id);
      } catch (err: any) {
        errors.push(
          `Failed executing tracker action [${action.type}] on ${action.path}: ${err.message}`,
        );
        break;
      }
    }
    return errors;
  }

  clearStaging(): void {
    this.overlay.clear();
    this.deleted.clear();
  }
}