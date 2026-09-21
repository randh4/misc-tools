from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import os

from app.services.network import inspect_port, inspect_http, inspect_rdap, probe_ssl_cert
from app.core.security import resolve_safe_ip

app = FastAPI(title="IT Engineer Toolbox", docs_url=None, redoc_url=None)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

class PortCheckReq(BaseModel):
    host: str
    port: int

class HttpCheckReq(BaseModel):
    url: str

class SslCheckReq(BaseModel):
    host: str
    port: int = 443

class RdapReq(BaseModel):
    target: str

class DnsReq(BaseModel):
    domain: str
    record_type: str = "A"

@app.post("/api/network/port")
async def api_check_port(req: PortCheckReq):
    try:
        res = inspect_port(req.host, req.port)
        return res
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/api/network/http")
async def api_check_http(req: HttpCheckReq):
    try:
        res = inspect_http(req.url)
        return res
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/api/network/ssl")
async def api_check_ssl(req: SslCheckReq):
    try:
        res = probe_ssl_cert(req.host, req.port)
        return res
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/api/network/rdap")
async def api_check_rdap(req: RdapReq):
    try:
        res = inspect_rdap(req.target)
        return res
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/api/network/dns")
async def api_check_dns(req: DnsReq):
    try:
        safe_ip = resolve_safe_ip(req.domain)
        return {"domain": req.domain, "record_type": req.record_type, "resolved_ip": safe_ip}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
