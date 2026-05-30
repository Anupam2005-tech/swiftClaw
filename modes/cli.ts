import chalk from "chalk";
import { select, isCancel } from "@clack/prompts";
import { runAgentmode } from "./agent/orchestrator";
import { runAskMode } from "./ask/orchestrator";
import { runPlanMode } from "./plan/orchestrator";
import { ensureOpenRouterKey } from "../utils/config.ts";

export async function runCliMode() {
    while (true){
        const mode=await select({
            message:"Choose CLI sub-mode",
            options:[
                {value:"agent",label:"Agent Mode"},
                {value:"plan",label:"Plan Mode"},
                {value:"ask",label:"Ask Mode"},
                {value:"back",label:"Back to main menu"}

            ]
        })
        if (isCancel(mode) || mode === "back") return;
        if (mode === "agent" || mode === "plan" || mode === "ask") {
          if (!(await ensureOpenRouterKey())) continue;
        }
        if(mode==="agent"){await runAgentmode() }
        else if(mode==="plan"){await runPlanMode()}
        else if(mode==="ask"){await runAskMode()}
        else{
            console.log(chalk.yellowBright("\n That mode is not implemented yet\n"))
        }
        
    }
}