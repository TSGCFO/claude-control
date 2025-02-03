import os
import sys
import json
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
import pyautogui
from rich.console import Console
from rich.logging import RichHandler
from rich.prompt import Confirm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[RichHandler(rich_tracebacks=True)]
)
logger = logging.getLogger("claude_control")
console = Console()

# Initialize FastAPI app
app = FastAPI(title="Claude Control Interface")

# Security configuration
API_KEY_NAME = "X-API-Key"
API_KEY = os.getenv("CLAUDE_CONTROL_API_KEY", "your-secure-api-key-here")
api_key_header = APIKeyHeader(name=API_KEY_NAME)

class Command(BaseModel):
    """Model for incoming command requests"""
    action: str
    parameters: Dict[str, Any] = {}
    confirmation_required: bool = True

def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    if api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

@app.post("/execute")
async def execute_command(
    command: Command,
    api_key: str = Security(verify_api_key)
):
    """Execute a system command with safety checks"""
    logger.info(f"Received command: {command.action}")
    
    try:
        # Confirm potentially dangerous operations
        if command.confirmation_required:
            if not Confirm.ask(
                f"Allow execution of {command.action} with parameters {command.parameters}?"
            ):
                raise HTTPException(
                    status_code=403,
                    detail="Command execution denied by user"
                )
        
        # Execute command based on action type
        if command.action == "mouse_move":
            x = command.parameters.get("x")
            y = command.parameters.get("y")
            pyautogui.moveTo(x, y)
            return {"status": "success", "message": f"Moved mouse to ({x}, {y})"}
            
        elif command.action == "mouse_click":
            pyautogui.click()
            return {"status": "success", "message": "Performed mouse click"}
            
        elif command.action == "type_text":
            text = command.parameters.get("text")
            pyautogui.typewrite(text)
            return {"status": "success", "message": f"Typed text: {text}"}
            
        elif command.action == "key_press":
            key = command.parameters.get("key")
            pyautogui.press(key)
            return {"status": "success", "message": f"Pressed key: {key}"}
            
        elif command.action == "system_command":
            # Extra safety check for system commands
            if not Confirm.ask(
                "[red]Warning: About to execute system command. Continue?[/red]"
            ):
                raise HTTPException(
                    status_code=403,
                    detail="System command execution denied"
                )
            cmd = command.parameters.get("command")
            result = os.system(cmd)
            return {
                "status": "success",
                "message": f"Executed system command: {cmd}",
                "result": result
            }
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown action: {command.action}"
            )
            
    except Exception as e:
        logger.exception("Error executing command")
        raise HTTPException(
            status_code=500,
            detail=f"Command execution failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    console.print("[bold green]Starting Claude Control Interface[/bold green]")
    console.print(f"API Key: {API_KEY}")
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )