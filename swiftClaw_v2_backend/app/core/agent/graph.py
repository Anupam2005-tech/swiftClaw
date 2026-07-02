from langgraph.graph import StateGraph, END
from app.core.agent.state import AgentState
from app.core.agent.nodes.complexity_scorer import complexity_scorer_node
from app.core.agent.nodes.router import router_node
from app.core.agent.nodes.generator import generator_node
from app.core.agent.nodes.evaluator import evaluator_node

def route_evaluation(state: AgentState) -> str:
    """
    Conditional edge that checks if evaluation passed or max retries exceeded.
    """
    evaluation = state.get("evaluation") or {}
    passed = evaluation.get("pass", False)
    retries = state.get("retries", 0)
    max_retries = state.get("max_retries", 3)
    
    if passed or retries >= max_retries:
        return "end"
    else:
        return "generator"

def compile_graph():
    # Define the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("complexity_scorer", complexity_scorer_node)
    workflow.add_node("router", router_node)
    workflow.add_node("generator", generator_node)
    workflow.add_node("evaluator", evaluator_node)
    
    # Add edges
    workflow.set_entry_point("complexity_scorer")
    workflow.add_edge("complexity_scorer", "router")
    workflow.add_edge("router", "generator")
    workflow.add_edge("generator", "evaluator")
    
    # Conditional edge
    workflow.add_conditional_edges(
        "evaluator",
        route_evaluation,
        {
            "generator": "generator",
            "end": END
        }
    )
    
    return workflow.compile()

# Module-level compiled graph singleton
agent_graph = compile_graph()
