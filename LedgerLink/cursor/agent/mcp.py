from typing import Dict, Any, Optional
import threading
from dataclasses import dataclass

@dataclass
class AgentContext:
    """Context for cursor agent interactions"""
    agent_id: str
    state: Dict[str, Any]
    cursor_position: Optional[tuple] = None
    active_file: Optional[str] = None
    
class CursorMCPServer:
    """Model Context Protocol server for Cursor agent system"""
    def __init__(self):
        self._agent_contexts: Dict[str, AgentContext] = {}
        self._lock = threading.Lock()
        
    def update_agent_context(self, agent_id: str, state: Dict[str, Any],
                           cursor_position: Optional[tuple] = None,
                           active_file: Optional[str] = None) -> None:
        """Update or create an agent's context"""
        with self._lock:
            self._agent_contexts[agent_id] = AgentContext(
                agent_id=agent_id,
                state=state,
                cursor_position=cursor_position,
                active_file=active_file
            )
            
    def get_agent_context(self, agent_id: str) -> Optional[AgentContext]:
        """Get the current context for an agent"""
        with self._lock:
            return self._agent_contexts.get(agent_id)
            
    def remove_agent_context(self, agent_id: str) -> None:
        """Remove an agent's context"""
        with self._lock:
            self._agent_contexts.pop(agent_id, None)
            
    def get_all_contexts(self) -> Dict[str, AgentContext]:
        """Get all active agent contexts"""
        with self._lock:
            return self._agent_contexts.copy() 