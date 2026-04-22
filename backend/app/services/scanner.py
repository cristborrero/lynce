import ssl
import socket
import httpx
import re
import os
import dns.resolver
import whois
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

# Constants for WPScan (requires API key)
WPSCAN_API_URL = "https://wpscan.com/api/v3"
SSLLABS_API_URL = "https://api.ssllabs.com/api/v4/analyze"

class ScannerEngine:
    def __init__(self, google_api_key: Optional[str] = None, wpscan_api_key: Optional[str] = None):
        self.google_api_key = google_api_key or os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY")
        self.wpscan_api_key = wpscan_api_key or os.environ.get("WPSCAN_API_KEY")

    async def ssl_check(self, url: str) -> Dict[str, Any]:
        hostname = urlparse(url).hostname
        if not hostname:
            return {
                "status": "fail",
                "severity": "critical",
                "title": "Invalid URL",
                "description": "The provided URL is invalid.",
                "recommendation": "Check the URL format.",
                "days_left": 0
            }

        context = ssl.create_default_context()
        try:
            with socket.create_connection((hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    tls_version = ssock.version()
                    
                    expiry_date = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_left = (expiry_date - datetime.utcnow()).days
                    
                    if days_left <= 0:
                        return {
                            "status": "fail",
                            "severity": "critical",
                            "title": "SSL Certificate Expired",
                            "description": f"The SSL certificate for {hostname} has expired.",
                            "recommendation": "Renew your SSL certificate immediately.",
                            "days_left": days_left
                        }
                    
                    status = "pass"
                    severity = "low"
                    if days_left < 30:
                        status = "warning"
                        severity = "medium"
                    
                    return {
                        "status": status,
                        "severity": severity,
                        "title": "SSL Certificate Valid",
                        "description": f"SSL is valid via {tls_version}. Expires in {days_left} days.",
                        "recommendation": "Ensure auto-renewal is enabled.",
                        "days_left": days_left
                    }
        except Exception as e:
            return {
                "status": "fail",
                "severity": "critical",
                "title": "SSL Connection Failed",
                "description": f"Could not establish a secure connection: {str(e)}",
                "recommendation": "Verify your SSL configuration and port 443 availability.",
                "days_left": 0
            }

    async def headers_check(self, url: str) -> Dict[str, Any]:
        required_headers = {
            "Strict-Transport-Security": {"severity": "high", "desc": "HSTS ensures browsers only use HTTPS."},
            "Content-Security-Policy": {"severity": "high", "desc": "CSP prevents XSS and data injection."},
            "X-Frame-Options": {"severity": "medium", "desc": "Prevents clickjacking attacks."},
            "X-Content-Type-Options": {"severity": "low", "desc": "Prevents MIME-sniffing."},
            "Permissions-Policy": {"severity": "low", "desc": "Restricts browser features like camera/location."}
        }
        
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                response = await client.get(url)
                headers = response.headers
                missing = [h for h in required_headers if h not in headers]
                
                if not missing:
                    return {
                        "status": "pass",
                        "severity": "low",
                        "title": "Security Headers Present",
                        "description": "All core security headers were detected.",
                        "recommendation": "Periodically review CSP and HSTS policies.",
                        "missing_count": 0
                    }
                
                return {
                    "status": "fail" if len(missing) > 1 else "warning",
                    "severity": "high" if any(required_headers[h]["severity"] == "high" for h in missing) else "medium",
                    "title": f"Missing Security Headers ({len(missing)})",
                    "description": f"The following headers are missing: {', '.join(missing)}.",
                    "recommendation": "Implement the missing headers in your server configuration.",
                    "missing_count": len(missing)
                }
        except Exception as e:
            return {"status": "warning", "severity": "medium", "title": "Header Check Error", "description": str(e), "recommendation": "Retry scan.", "missing_count": 0}

    async def wordpress_check(self, url: str) -> Dict[str, Any]:
        version = "Unknown"
        exposed = False
        
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            # Parallelize probes
            tasks = [
                client.get(url),
                client.get(f"{url.rstrip('/')}/feed/"),
                client.get(f"{url.rstrip('/')}/readme.html")
            ]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Check homepage
            if not isinstance(responses[0], Exception):
                match = re.search(r'name="generator" content="WordPress ([\d\.]+)"', responses[0].text)
                if match:
                    version = match.group(1)
                    exposed = True
            
            # Check feed
            if not exposed and not isinstance(responses[1], Exception):
                match = re.search(r'<generator>https://wordpress.org/\?v=([\d\.]+)</generator>', responses[1].text)
                if match:
                    version = match.group(1)
                    exposed = True
            
            # Check readme
            if not exposed and not isinstance(responses[2], Exception) and responses[2].status_code == 200:
                match = re.search(r'<br /> Version ([\d\.]+)', responses[2].text)
                if match:
                    version = match.group(1)
                    exposed = True

        if exposed:
            return {
                "status": "fail",
                "severity": "medium",
                "title": f"WordPress Version Exposed: v{version}",
                "description": "Publicly exposing your WordPress version helps attackers find version-specific exploits.",
                "recommendation": "Remove the version meta tag and restrict access to readme.html.",
                "version_exposed": True
            }
        
        return {
            "status": "pass",
            "severity": "low",
            "title": "WordPress Version Masked",
            "description": "WordPress version is not easily detectable.",
            "recommendation": "Keep plugins and themes updated even if version is hidden.",
            "version_exposed": False
        }

    async def sensitive_files_check(self, url: str) -> Dict[str, Any]:
        probes = [
            {"path": "/wp-config.php", "title": "WordPress Config", "severity": "critical"},
            {"path": "/.env", "title": "Environment File", "severity": "critical"},
            {"path": "/.git/config", "title": "Git Config", "severity": "high"},
            {"path": "/xmlrpc.php", "title": "XML-RPC Interface", "severity": "medium"},
            {"path": "/wp-json/wp/v2/users", "title": "User Enumeration API", "severity": "medium"}
        ]
        
        exposed = []
        async with httpx.AsyncClient(timeout=5) as client:
            tasks = [client.get(f"{url.rstrip('/')}{p['path']}") for p in probes]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, r in enumerate(responses):
                if isinstance(r, Exception): continue
                if r.status_code == 200 and len(r.text) > 0:
                    probe = probes[i]
                    if "users" in probe['path'] and "[" not in r.text[:10]:
                        continue
                    exposed.append(probe)

        if exposed:
            return {
                "status": "fail",
                "severity": "critical" if any(e['severity'] == 'critical' for e in exposed) else "high",
                "title": f"Sensitive Files/APIs Exposed ({len(exposed)})",
                "description": f"Found: {', '.join([e['title'] for e in exposed])}",
                "recommendation": "Restrict access to these files via .htaccess or server config.",
                "exposed_count": len(exposed)
            }
            
        return {
            "status": "pass",
            "severity": "low",
            "title": "No Sensitive Files Publicly Exposed",
            "description": "Common sensitive files were not directly accessible.",
            "recommendation": "Ensure your file permissions are correctly set to 644 or 600.",
            "exposed_count": 0
        }

    async def blacklist_check(self, url: str) -> Dict[str, Any]:
        if not self.google_api_key:
            return {
                "status": "warning", 
                "severity": "low", 
                "title": "Blacklist Check Skipped", 
                "description": "Google API key missing.", 
                "recommendation": "Configure GOOGLE_SAFE_BROWSING_API_KEY.",
                "is_blacklisted": False
            }

        api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={self.google_api_key}"
        payload = {
            "client": {"clientId": "aegiscms", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.post(api_url, json=payload)
                data = r.json()
                if "matches" in data:
                    return {
                        "status": "fail",
                        "severity": "critical",
                        "title": "Site Blacklisted",
                        "description": "Google Safe Browsing reports this site as malicious.",
                        "recommendation": "Clean your site and request a review via Search Console.",
                        "is_blacklisted": True
                    }
        except: pass
        
        return {
            "status": "pass",
            "severity": "low",
            "title": "Clean Reputation",
            "description": "Site is not listed on major blacklists.",
            "recommendation": "Monitor your site reputation regularly.",
            "is_blacklisted": False
        }
        
    async def wp_vulnerability_check(self, url: str) -> Dict[str, Any]:
        if not self.wpscan_api_key:
            return {"status": "warning", "severity": "low", "title": "WPScan Skipped", "description": "WPScan API key missing.", "findings": []}

        # Detection logic (simplified: probe for common versions/plugins)
        # Note: In a real scenario, we'd crawl or use a better detection library
        detected_plugins = []
        # Example: probe for Akismet and Yoast SEO
        plugins_to_check = ["akismet", "wordpress-seo"]
        
        async with httpx.AsyncClient(timeout=10) as client:
            # 1. Check WordPress Core version for vulnerabilities
            # We already have version detection in wordpress_check, let's reuse/extend
            wp_data = await self.wordpress_check(url)
            wp_version = wp_data.get("title", "").split("v")[-1] if wp_data.get("version_exposed") else None
            
            findings = []
            if wp_version:
                try:
                    r = await client.get(
                        f"{WPSCAN_API_URL}/wordpresses/{wp_version.replace('.', '')}",
                        headers={"Authorization": f"Token token={self.wpscan_api_key}"}
                    )
                    if r.status_code == 200:
                        core_vulns = r.json().get(wp_version, {}).get("vulnerabilities", [])
                        for v in core_vulns:
                            findings.append({
                                "type": "core",
                                "name": "WordPress Core",
                                "version": wp_version,
                                "cve": v.get("cve"),
                                "severity": v.get("cvss", {}).get("score", "Medium"),
                                "fixed_in": v.get("fixed_in")
                            })
                except: pass

            # 2. Check Plugins (parallelized)
            async def check_plugin(plugin):
                try:
                    # Very basic version detection via readme.txt
                    pr = await client.get(f"{url.rstrip('/')}/wp-content/plugins/{plugin}/readme.txt", timeout=4)
                    if pr.status_code == 200:
                        ver_match = re.search(r'Stable tag: ([\d\.]+)', pr.text)
                        plugin_ver = ver_match.group(1) if ver_match else "unknown"
                        
                        vr = await client.get(
                            f"{WPSCAN_API_URL}/plugins/{plugin}",
                            headers={"Authorization": f"Token token={self.wpscan_api_key}"},
                            timeout=4
                        )
                        if vr.status_code == 200:
                            vulnerabilities = vr.json().get(plugin, {}).get("vulnerabilities", [])
                            local_findings = []
                            for v in vulnerabilities:
                                local_findings.append({
                                    "type": "plugin",
                                    "name": plugin,
                                    "version": plugin_ver,
                                    "cve": v.get("cve"),
                                    "severity": "High" if v.get("fixed_in") else "Medium",
                                    "fixed_in": v.get("fixed_in")
                                })
                            return local_findings
                except: pass
                return []

            plugin_tasks = [check_plugin(p) for p in plugins_to_check]
            plugin_results = await asyncio.gather(*plugin_tasks)
            for res in plugin_results:
                findings.extend(res)

        if findings:
            return {
                "status": "fail",
                "severity": "high",
                "title": f"WP Vulnerabilities Found ({len(findings)})",
                "description": f"Detected {len(findings)} known vulnerabilities in WP core/plugins.",
                "findings": findings,
                "recommendation": "Update WordPress core and all plugins to their latest versions."
            }
        
        return {
            "status": "pass",
            "severity": "low",
            "title": "No WP Vulnerabilities Detected",
            "description": "No active vulnerabilities found for detected WordPress components.",
            "findings": [],
            "recommendation": "Maintain a regular update schedule."
        }

    async def ssl_labs_check(self, hostname: str) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                # First check for cached results to avoid waiting minutes
                params = {"host": hostname, "fromCache": "on", "all": "done"}
                r = await client.get(SSLLABS_API_URL, params=params)
                data = r.json()
                
                # If not in cache or not ready, trigger a new scan but don't wait (for now)
                if data.get("status") in ["DNS", "IN_PROGRESS"]:
                    return {
                        "status": "warning",
                        "severity": "low",
                        "title": "SSL Labs Grade: Scan in Progress",
                        "description": "A deep SSL/TLS scan is currently running. Results will be available shortly.",
                        "grade": "N/A",
                        "recommendation": "Check back in 2-3 minutes for the full A+ grade report."
                    }
                
                endpoints = data.get("endpoints", [])
                if not endpoints:
                    return {"status": "fail", "severity": "medium", "title": "SSL Labs Scan Failed", "description": "No endpoints found.", "grade": "F"}
                
                main_endpoint = endpoints[0]
                grade = main_endpoint.get("grade", "F")
                details = main_endpoint.get("details", {})
                
                status = "pass" if grade in ["A+", "A", "A-"] else "warning" if grade in ["B", "C"] else "fail"
                severity = "low" if status == "pass" else "medium" if status == "warning" else "high"
                
                hsts = "Enabled" if details.get("hstsPolicy") else "Disabled"
                
                return {
                    "status": status,
                    "severity": severity,
                    "title": f"SSL Labs Grade: {grade}",
                    "description": f"Protocol support: {', '.join([p.get('name') + ' ' + p.get('version') for p in details.get('protocols', [])])}",
                    "grade": grade,
                    "hsts_preload": hsts,
                    "recommendation": "Aim for A+ by enabling HSTS and disabling older protocols (TLS 1.0/1.1)."
                }
        except Exception as e:
            return {"status": "warning", "severity": "low", "title": "SSL Labs Error", "description": str(e), "grade": "Unknown"}

    async def domain_security_check(self, hostname: str) -> Dict[str, Any]:
        try:
            w = whois.whois(hostname)
            creation_date = w.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            
            if creation_date and creation_date.tzinfo:
                creation_date = creation_date.replace(tzinfo=None)
            
            if not creation_date:
                return {"status": "warning", "severity": "low", "title": "Domain Age Unknown", "description": "Could not determine domain registration date.", "age_months": 0}
            
            age_days = (datetime.utcnow() - creation_date).days
            age_months = age_days // 30
            
            if age_months < 6:
                return {
                    "status": "fail",
                    "severity": "high",
                    "title": f"Domain Risk: New Registration ({age_months} months)",
                    "description": "This domain was registered less than 6 months ago, posing a higher phishing risk.",
                    "recommendation": "Exercise caution if this is a financial or high-profile site.",
                    "age_months": age_months
                }
            
            return {
                "status": "pass",
                "severity": "low",
                "title": f"Domain Reputation: Established",
                "description": f"Domain age is {age_months} months.",
                "recommendation": "Maintain WHOIS privacy settings.",
                "age_months": age_months
            }
        except Exception as e:
            return {"status": "warning", "severity": "low", "title": "WHOIS Check Failed", "description": str(e), "age_months": 0}

    async def tech_fingerprint(self, url: str) -> Dict[str, Any]:
        technologies = []
        server = "Unknown"
        cms = "Unknown"
        cdn = "None"
        
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                r = await client.get(url)
                headers = r.headers
                
                # Server detection
                server = headers.get("Server", "Unknown")
                if server != "Unknown": technologies.append(f"Server: {server}")
                
                # CMS detection
                if "wp-content" in r.text or "wp-includes" in r.text:
                    cms = "WordPress"
                    technologies.append("CMS: WordPress")
                elif "Joomla" in r.text:
                    cms = "Joomla"
                    technologies.append("CMS: Joomla")
                
                # CDN detection
                if "cf-ray" in headers or "cloudflare" in server.lower():
                    cdn = "Cloudflare"
                    technologies.append("CDN: Cloudflare")
                elif "x-amz-cf-id" in headers:
                    cdn = "Amazon CloudFront"
                    technologies.append("CDN: CloudFront")
                
                # Flag outdated (very basic logic)
                status = "pass"
                recommendation = "Regularly update your server software."
                if "Apache/2.2" in server or "nginx/1.10" in server:
                    status = "warning"
                    recommendation = "Your server version appears to be outdated. Consider upgrading."

                return {
                    "status": status,
                    "severity": "medium" if status == "warning" else "low",
                    "title": f"Tech Stack: {cms} on {server}",
                    "description": f"Detected: {', '.join(technologies) if technologies else 'Basic Web Server'}",
                    "cms": cms,
                    "server": server,
                    "cdn": cdn,
                    "recommendation": recommendation
                }
        except:
            return {"status": "warning", "severity": "low", "title": "Fingerprinting Failed", "description": "Could not access headers."}

    async def email_security_check(self, domain: str) -> Dict[str, Any]:
        findings = []
        spf_present = False
        dmarc_present = False
        
        try:
            # Check SPF
            try:
                answers = dns.resolver.resolve(domain, 'TXT')
                for rdata in answers:
                    if 'v=spf1' in str(rdata):
                        spf_present = True
                        break
            except: pass
            
            # Check DMARC
            try:
                answers = dns.resolver.resolve(f'_dmarc.{domain}', 'TXT')
                for rdata in answers:
                    if 'v=DMARC1' in str(rdata):
                        dmarc_present = True
                        break
            except: pass
            
            if not spf_present: findings.append("Missing SPF record")
            if not dmarc_present: findings.append("Missing DMARC policy")
            
            status = "pass" if spf_present and dmarc_present else "warning"
            
            return {
                "status": status,
                "severity": "medium" if status == "warning" else "low",
                "title": "Email Security Rules",
                "description": "Verified SPF and DMARC configuration." if status == "pass" else f"Issues: {', '.join(findings)}",
                "spf": "Present" if spf_present else "Missing",
                "dmarc": "Configured" if dmarc_present else "Missing",
                "recommendation": "Configure SPF and DMARC to prevent email spoofing and phishing."
            }
        except:
            return {"status": "warning", "severity": "low", "title": "Email Security Check Error", "description": "Could not query DNS records."}

async def scan_site(url: str) -> Dict[str, Any]:
    engine = ScannerEngine()
    hostname = urlparse(url).hostname or ""
    domain = ".".join(hostname.split(".")[-2:]) if hostname else ""
    
    results = await asyncio.gather(
        engine.ssl_check(url),
        engine.headers_check(url),
        engine.wordpress_check(url),
        engine.sensitive_files_check(url),
        engine.blacklist_check(url),
        engine.wp_vulnerability_check(url),
        engine.ssl_labs_check(hostname),
        engine.domain_security_check(hostname),
        engine.tech_fingerprint(url),
        engine.email_security_check(domain)
    )
    
    checks = {
        "ssl": results[0],
        "headers": results[1],
        "wordpress": results[2],
        "sensitive_files": results[3],
        "blacklist": results[4],
        "wp_vulnerabilities": results[5],
        "ssl_labs": results[6],
        "domain_age": results[7],
        "technologies": results[8],
        "email_security": results[9]
    }
    
    # Enterprise Scoring Logic (Weighted Deductions)
    score = 100
    
    # Category 1: Critical Risks (Immediate Action Required)
    if checks["blacklist"].get("is_blacklisted"): 
        score -= 40  # Heavily weighted
    
    if checks["sensitive_files"].get("exposed_count", 0) > 0:
        # 15 per file, but capped at 30 to avoid negative scores on massive exposure
        exposure_deduction = min(30, checks["sensitive_files"]["exposed_count"] * 15)
        score -= exposure_deduction

    # Category 2: High Risks (Structural Vulnerabilities)
    if checks["wp_vulnerabilities"]["status"] == "fail":
        score -= 20
        
    if checks["ssl"]["status"] == "fail":
        score -= 15
    elif checks["ssl"]["days_left"] < 30:
        score -= 5

    ssl_grade = checks["ssl_labs"].get("grade", "A")
    if ssl_grade in ["D", "E", "F"]:
        score -= 15
    elif ssl_grade in ["B", "C"]:
        score -= 8

    # Category 3: Medium Risks (Configuration & Reputation)
    if checks["domain_age"]["status"] == "fail":
        score -= 10
    
    if checks["wordpress"].get("version_exposed"):
        score -= 8

    # Headers: 3 points per missing important header, capped at 12
    missing_headers = checks["headers"].get("missing_count", 0)
    score -= min(12, missing_headers * 3)

    # Email security: Missing DMARC/SPF is a risk but not critical for site code
    if checks["email_security"]["status"] == "warning":
        score -= 5

    final_score = max(0, score)
    
    # Determine Grade based on Enterprise standards
    grade = "CRITICAL"
    if final_score >= 85: grade = "SECURE"
    elif final_score >= 60: grade = "AT RISK"

    return {
        "overall_score": final_score,
        "checks": checks,
        "scanned_at": datetime.utcnow().isoformat(),
        "url": url,
        "grade": grade,
        "is_enterprise": final_score >= 90
    }

import asyncio
