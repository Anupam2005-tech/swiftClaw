import { tool } from "ai";
import { z } from "zod";
import { ToolExecutor } from "./tool-executor";
import { TOOL_DESCRIPTIONS } from "../prompts";

//create Agent tools

export function createAgentTools(
  executor: ToolExecutor,
  onStatus?: (status: string) => void
) {
  return {
    read_file: tool({
      description: TOOL_DESCRIPTIONS.read_file,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Reading file: ${path}`);
        return executor.readFile(path);
      },
    }),
    createfile: tool({
      description: TOOL_DESCRIPTIONS.createfile,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
        content: z.string().describe("Content of the file"),
      }),
      execute: async ({ path, content }) => {
        onStatus?.(`Staging file creation: ${path}`);
        executor.createFile(path, content);
        return `Successfully staged file creation for ${path}`;
      },
    }),

    modify_file: tool({
      description: TOOL_DESCRIPTIONS.modify_file,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file"),
        content: z.string().describe("Content of the file"),
      }),
      execute: async ({ path, content }) => {
        onStatus?.(`Staging file modification: ${path}`);
        executor.modifyFile(path, content);
        return `Successfully staged file modification for ${path}`;
      },
    }),

    delete_file: tool({
      description: TOOL_DESCRIPTIONS.delete_file,
      inputSchema: z.object({
        path: z.string(),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Staging file deletion: ${path}`);
        executor.deleteFile(path);
        return `Successfully staged file deletion for ${path}`;
      },
    }),

    create_Folder: tool({
      description: TOOL_DESCRIPTIONS.create_Folder,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the folder"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Staging folder creation: ${path}`);
        executor.createFolder(path);
        return `Successfully staged folder creation for ${path}`;
      },
    }),

    list_files: tool({
      description: TOOL_DESCRIPTIONS.list_files,
      inputSchema: z.object({
        path: z.string().describe("Relative path to the folder"),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path, recursive }) => {
        onStatus?.(`Listing files in: ${path}`);
        return executor.listDirectory(path, recursive);
      },
    }),

    search_files: tool({
      description: TOOL_DESCRIPTIONS.search_files,
      inputSchema: z.object({
        root: z.string().describe("Directory to search, relative to project root"),
        pattern: z
          .string()
          .describe("Glob pattern (e.g., '*.ts', '**/*.md')"),
        content_contains: z.string().optional().describe("Optional substring to filter file contents"),
      }),
      execute: async ({ root, pattern, content_contains }) => {
        onStatus?.(`Searching files in ${root} for ${pattern}`);
        return executor.searchFiles(root, pattern, content_contains);
      },
    }),

    analyze_codebase: tool({
      description: TOOL_DESCRIPTIONS.analyze_codebase,
      inputSchema: z.object({
        path: z.string().default(".").describe("Relative path, defaults to project root"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Analyzing codebase at: ${path}`);
        return executor.analyzeCodebase(path);
      },
    }),

    execute_shell: tool({
      description: TOOL_DESCRIPTIONS.execute_shell,
      inputSchema: z.object({
        command: z.string().describe("Single command; runs with shell: true"),
      }),
      execute: async ({ command }) => {
        onStatus?.(`Staging shell command: ${command}`);
        executor.queueShell(command);
        return `Command staged successfully for execution. Pending user approval.`;
      },
    }),
    list_skills: tool({
      description: TOOL_DESCRIPTIONS.list_skills,
      inputSchema: z.object({}),
      execute: async () => {
        onStatus?.("Listing available skills");
        return executor.listSkills();
      },
    }),

    read_skill_docs:tool({
      description: TOOL_DESCRIPTIONS.read_skill_docs,
      inputSchema: z.object({
        path:z.string().describe("Absolute path to a SKILL.md file (from list_skills)"),
      }),
      execute: async ({ path }) => {
        onStatus?.(`Reading skill docs: ${path}`);
        return executor.readSkill(path);
      },
    })
  };
}
