import socket
import ssl
from typing import Any, Dict, List
from app.core.security import is_safe_ip, resolve_safe_ip, safe_http_request


def inspect_port(host: str, port: int, timeout: float = 2.0) -> Dict[str, Any]:
    safe_ip = resolve_safe_ip(host)
    is_ipv6 = ":" in safe_ip
    sock_family = socket.AF_INET6 if is_ipv6 else socket.AF_INET
    
    sock = socket.socket(sock_family, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        res = sock.connect_ex((safe_ip, port))
        is_open = (res == 0)
    finally:
        sock.close()

    return {
        "host": host,
        "resolved_ip": safe_ip,
        "port": port,
        "open": is_open,
    }


def inspect_http(url: str, timeout: float = 5.0) -> Dict[str, Any]:
    response = safe_http_request("GET", url, timeout=timeout)
    return {
        "status_code": response.status_code,
        "url": str(response.url),
        "headers": dict(response.headers),
        "content_length": len(response.content),
    }


def inspect_rdap(target: str, timeout: float = 5.0) -> Dict[str, Any]:
    safe_ip = resolve_safe_ip(target)
    endpoint = f"https://rdap.org/ip/{safe_ip}" if is_safe_ip(target) else f"https://rdap.org/domain/{target}"
    response = safe_http_request("GET", endpoint, timeout=timeout)
    if response.status_code != 200:
        return {
            "target": target,
            "resolved_ip": safe_ip,
            "status": response.status_code,
            "error": "RDAP query returned non-200 status",
        }
    return response.json()


def probe_ssl_cert(host: str, port: int = 443, timeout: float = 3.0) -> Dict[str, Any]:
    safe_ip = resolve_safe_ip(host)
    is_ipv6 = ":" in safe_ip
    sock_family = socket.AF_INET6 if is_ipv6 else socket.AF_INET

    context = ssl.create_default_context()
    raw_sock = socket.socket(sock_family, socket.SOCK_STREAM)
    raw_sock.settimeout(timeout)

    try:
        raw_sock.connect((safe_ip, port))
        with context.wrap_socket(raw_sock, server_hostname=host) as ssock:
            cert = ssock.getpeercert()
            return {
                "host": host,
                "resolved_ip": safe_ip,
                "port": port,
                "subject": dict(x[0] for x in cert.get("subject", ())),
                "issuer": dict(x[0] for x in cert.get("issuer", ())),
                "version": cert.get("version"),
                "notBefore": cert.get("notBefore"),
                "notAfter": cert.get("notAfter"),
                "cipher": ssock.cipher(),
            }
    finally:
        raw_sock.close()
