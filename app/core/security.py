import ipaddress
import socket
from typing import Optional
import httpx

BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("255.255.255.255/32"),
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::ffff:0:0/96"),
    ipaddress.ip_network("64:ff9b::/96"),
    ipaddress.ip_network("100::/64"),
    ipaddress.ip_network("2001:db8::/32"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("ff00::/8"),
]


def is_safe_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        if (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            return False
        for net in BLOCKED_NETWORKS:
            if ip in net:
                return False
        return True
    except ValueError:
        return False


def resolve_safe_ip(host: str) -> str:
    try:
        ip = ipaddress.ip_address(host)
        if not is_safe_ip(str(ip)):
            raise ValueError(f"Restricted target IP: {ip}")
        return str(ip)
    except ValueError:
        pass

    try:
        addr_info = socket.getaddrinfo(host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except socket.gaierror as e:
        raise ValueError(f"DNS resolution failed for {host}: {e}")

    if not addr_info:
        raise ValueError(f"No address found for {host}")

    for item in addr_info:
        candidate_ip = item[4][0]
        if not is_safe_ip(candidate_ip):
            raise ValueError(f"Host {host} resolved to restricted IP {candidate_ip}")

    return str(addr_info[0][4][0])


def safe_http_request(
    method: str,
    url: str,
    max_redirects: int = 5,
    timeout: float = 10.0,
    headers: Optional[dict] = None,
    **kwargs,
) -> httpx.Response:
    current_url = httpx.URL(url)
    if not current_url.host:
        raise ValueError("Invalid URL: missing host")

    safe_ip = resolve_safe_ip(current_url.host)
    req_headers = dict(headers) if headers else {}
    req_headers["Host"] = current_url.netloc.decode() if isinstance(current_url.netloc, bytes) else str(current_url.netloc)

    with httpx.Client(timeout=timeout, follow_redirects=False, verify=False) as client:
        for _ in range(max_redirects + 1):
            target_url = current_url.copy_with(host=safe_ip)
            response = client.request(method, target_url, headers=req_headers, **kwargs)
            if response.is_redirect:
                location = response.headers.get("location")
                if not location:
                    return response
                next_url = current_url.join(location)
                if not next_url.host:
                    raise ValueError(f"Invalid redirect target: {location}")
                safe_ip = resolve_safe_ip(next_url.host)
                current_url = next_url
                req_headers["Host"] = current_url.netloc.decode() if isinstance(current_url.netloc, bytes) else str(current_url.netloc)
            else:
                return response

    raise ValueError(f"Exceeded max redirects limit of {max_redirects}")
