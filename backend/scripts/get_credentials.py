"""
Utility script to take TokenCode, Authorization token, and Username and save them directly to .env.

Usage:
  1. Interactive prompt (default):
     python scripts/get_credentials.py

  2. Direct CLI flags:
     python scripts/get_credentials.py -u 2024xxxx -t <TOKENCODE> -a "Bearer <JWT>"

  3. Auto-capture via CTSV Browser Login (Playwright):
     python scripts/get_credentials.py --browser
"""

import argparse
import asyncio
import base64
import json
from pathlib import Path
import sys
from urllib.parse import parse_qs, urlparse

# Locate backend root and .env file
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

def update_env_file(username: str, token_code: str, authorization: str) -> None:
    """
    Safely update USERNAME, TOKENCODE, and AUTHORIZATION in the .env file,
    preserving comments and any other existing environment variables.
    """
    username = username.strip()
    token_code = token_code.strip()
    authorization = authorization.strip()

    # Ensure Authorization has Bearer prefix if a raw JWT is provided
    if authorization and not authorization.startswith("Bearer ") and authorization.startswith("ey"):
        authorization = f"Bearer {authorization}"

    updates = {
        "USERNAME": username,
        "TOKENCODE": token_code,
        "AUTHORIZATION": authorization,
    }

    lines: list[str] = []
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()

    updated_keys: set[str] = set()
    new_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            new_lines.append(line)
            continue

        if "=" in stripped:
            key, _ = stripped.split("=", 1)
            key_upper = key.strip().upper()
            if key_upper in updates:
                new_lines.append(f'{key_upper}="{updates[key_upper]}"\n')
                updated_keys.add(key_upper)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    # Append any keys that didn't exist in the file previously
    for key, val in updates.items():
        if key not in updated_keys:
            new_lines.append(f'{key}="{val}"\n')

    # Ensure parent directory exists and write file
    ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print("Credentials Saved Directly to .env")

def prompt_manual_input(
    default_username: str = "",
    default_tokencode: str = "",
    default_auth: str = ""
) -> tuple[str, str, str]:
    """Prompt user interactively in the terminal for the 3 credentials."""
    print("\n" + "=" * 60)
    print("  CTSV Credentials Input -> Save Directly to .env")
    print("=" * 60)

    user_prompt = f"Enter Username / Student ID [{default_username}]: " if default_username else "Enter Username / Student ID: "
    username = input(user_prompt).strip() or default_username

    code_prompt = f"Enter TokenCode [{default_tokencode}]: " if default_tokencode else "Enter TokenCode: "
    token_code = input(code_prompt).strip() or default_tokencode

    auth_prompt = f"Enter Authorization Token [{default_auth[:25]}...]: " if default_auth else "Enter Authorization Token (Bearer <JWT>): "
    authorization = input(auth_prompt).strip() or default_auth

    return username, token_code, authorization

def _extract_username_from_jwt(jwt_str: str) -> str:
    """Extract student ID / unique_name from JWT payload without verification."""
    try:
        parts = jwt_str.strip().split(".")
        if len(parts) >= 2:
            padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
            unique_name = payload.get("unique_name", "")
            if "\\" in unique_name:
                return unique_name.split("\\")[-1]
            if unique_name:
                return unique_name
            upn = payload.get("upn", "")
            if upn and "@" in upn:
                # e.g. binh.kt2416429 -> extract numbers if present
                import re
                nums = re.findall(r"\d+", upn.split("@")[0])
                if nums:
                    return nums[-1]
    except Exception:
        pass
    return ""

async def capture_credentials_via_browser() -> tuple[str, str, str]:
    """
    Launch Chrome, open CTSV login page, and intercept TokenCode, Authorization,
    and Username across:
    1. Browser Cookies (TokenCode, UserName)
    2. LocalStorage & SessionStorage (adal.access.token, idtoken)
    3. URL Hash Fragment (#access_token=... returned from ADFS login)
    4. Outgoing Network Requests (headers & payload)
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("❌ Playwright is not installed. Please install it using: pip install playwright")
        return "", "", ""

    captured = {
        "username": "",
        "token_code": "",
        "authorization": ""
    }

    async def handle_request(request):
        # 1. Capture Authorization header from any outgoing request
        auth = request.headers.get("authorization")
        if auth and not captured["authorization"]:
            captured["authorization"] = auth if auth.startswith("Bearer ") else f"Bearer {auth}"
            print(f"   [✓] Authorization header captured from network request ({len(captured['authorization'])} chars)")

        # 2. Check request POST data for TokenCode or UserName
        post_data = request.post_data
        if post_data:
            try:
                payload = json.loads(post_data)
                if isinstance(payload, dict):
                    if payload.get("TokenCode") and not captured["token_code"]:
                        captured["token_code"] = str(payload["TokenCode"]).strip()
                        print(f"   [✓] TokenCode captured from request payload: {captured['token_code']}")
                    if payload.get("UserName") and not captured["username"]:
                        captured["username"] = str(payload["UserName"]).strip()
                        print(f"   [✓] Username captured from request payload: {captured['username']}")
            except Exception:
                pass

    chrome_profile = BACKEND_DIR / "data" / "chrome_profile"
    chrome_profile.mkdir(parents=True, exist_ok=True)

    print("\n🌐 Launching Chrome for CTSV login session...")
    print("👉 Please log into https://ctsv.hust.edu.vn and solve Captcha.")
    print("👉 The script will automatically intercept TokenCode, Authorization token, and Username.\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=str(chrome_profile),
            headless=False,
            channel="chrome",
            args=["--start-maximized"]
        )

        page = await browser.new_page()
        page.on("request", handle_request)

        await page.goto("https://ctsv.hust.edu.vn/#/login")

        # Scan for up to 180 seconds
        for second in range(180):
            # A. Check Browser Cookies (Crucial: CTSV stores TokenCode & UserName as cookies!)
            try:
                cookies = await browser.cookies()
                for cookie in cookies:
                    c_name = cookie.get("name", "")
                    c_val = str(cookie.get("value", "")).strip()

                    if c_name == "TokenCode" and c_val and not captured["token_code"]:
                        captured["token_code"] = c_val
                        print(f"   [✓] TokenCode captured from Cookie: {c_val}")

                    if c_name == "UserName" and c_val and not captured["username"]:
                        captured["username"] = c_val
                        print(f"   [✓] Username captured from Cookie: {c_val}")

                    if c_name in ("token", "access-token") and c_val and not captured["authorization"]:
                        captured["authorization"] = f"Bearer {c_val}" if not c_val.startswith("Bearer ") else c_val
                        print(f"   [✓] Authorization captured from Cookie ({len(captured['authorization'])} chars)")
            except Exception:
                pass

            # B. Check Current URL (ADFS redirects to CTSV with #access_token=... & id_token=...)
            try:
                current_url = page.url
                if "#" in current_url:
                    fragment = current_url.split("#", 1)[1]
                    params = parse_qs(fragment)
                    if "access_token" in params and not captured["authorization"]:
                        token_val = params["access_token"][0]
                        captured["authorization"] = f"Bearer {token_val}"
                        print(f"   [✓] Authorization captured from URL redirect ({len(token_val)} chars)")

                    if "id_token" in params and not captured["username"]:
                        extracted_user = _extract_username_from_jwt(params["id_token"][0])
                        if extracted_user:
                            captured["username"] = extracted_user
                            print(f"   [✓] Username captured from URL id_token: {extracted_user}")
            except Exception:
                pass

            # C. Check window.localStorage and window.sessionStorage
            try:
                storage_data = await page.evaluate(
                    "() => { "
                    "  const data = {}; "
                    "  for (let i = 0; i < localStorage.length; i++) { data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); } "
                    "  for (let i = 0; i < sessionStorage.length; i++) { data[sessionStorage.key(i)] = sessionStorage.getItem(sessionStorage.key(i)); } "
                    "  return data; "
                    "}"
                )

                if isinstance(storage_data, dict):
                    # Check for TokenCode in storage
                    for k, v in storage_data.items():
                        if isinstance(v, str):
                            v_clean = v.strip()
                            if k.lower() == "tokencode" and v_clean and not captured["token_code"]:
                                captured["token_code"] = v_clean
                                print(f"   [✓] TokenCode captured from Storage: {v_clean}")

                            # Check for access token in ADAL storage
                            if ("access.token" in k.lower() or k.startswith("adal.access.token")) and v_clean and not captured["authorization"]:
                                captured["authorization"] = f"Bearer {v_clean}"
                                print(f"   [✓] Authorization captured from Storage key '{k}' ({len(v_clean)} chars)")

                            # Check any JWT value in storage
                            elif v_clean.startswith("eyJ") and len(v_clean) > 300 and not captured["authorization"]:
                                captured["authorization"] = f"Bearer {v_clean}"
                                print(f"   [✓] Authorization JWT token captured from Storage ({len(v_clean)} chars)")

                            # Extract student ID from idtoken
                            if "idtoken" in k.lower() and v_clean and not captured["username"]:
                                extracted_user = _extract_username_from_jwt(v_clean)
                                if extracted_user:
                                    captured["username"] = extracted_user
                                    print(f"   [✓] Username captured from Storage id_token: {extracted_user}")
            except Exception:
                pass

            # Check if all 3 have been captured!
            if captured["username"] and captured["token_code"] and captured["authorization"]:
                print("\n🎉 All 3 credentials intercepted successfully!")
                break

            await asyncio.sleep(1)

        await browser.close()

    return captured["username"], captured["token_code"], captured["authorization"]

def main():
    parser = argparse.ArgumentParser(
        description="Save CTSV TokenCode, Authorization, and Username directly to .env"
    )
    parser.add_argument("-u", "--username", help="Student ID / Username")
    parser.add_argument("-t", "--tokencode", help="TokenCode string")
    parser.add_argument("-a", "--auth", "--authorization", dest="authorization", help="Authorization Token")
    parser.add_argument("-b", "--browser", action="store_true", help="Launch browser to auto-capture credentials")
    parser.add_argument("-m", "--manual", action="store_true", help="Force interactive terminal prompt")

    args = parser.parse_args()

    # Case 1: All 3 provided via CLI arguments
    if args.username and args.tokencode and args.authorization:
        update_env_file(args.username, args.tokencode, args.authorization)
        return

    # Case 2: Browser auto-capture mode requested
    if args.browser:
        username, token_code, authorization = asyncio.run(capture_credentials_via_browser())
        if not (username and token_code and authorization):
            print("\n⚠️ Browser session completed with missing fields:")
            print(f"   • Username      : {username or 'MISSING'}")
            print(f"   • TokenCode     : {token_code or 'MISSING'}")
            print(f"   • Authorization : {'FOUND' if authorization else 'MISSING'}\n")
            print("Please enter any missing values manually:")
            username, token_code, authorization = prompt_manual_input(
                default_username=username,
                default_tokencode=token_code,
                default_auth=authorization
            )
        if username and token_code and authorization:
            update_env_file(username, token_code, authorization)
        else:
            print("❌ Operation cancelled: Missing required credentials.")
        return

    # Case 3: Partial CLI arguments or interactive mode
    if args.manual or (sys.stdin.isatty() and not (args.username or args.tokencode or args.authorization)):
        print("\nChoose credential acquisition method:")
        print("  [1] Enter manually (Username, TokenCode, Authorization Token) [Default]")
        print("  [2] Auto-capture from CTSV browser login (Playwright)")
        choice = input("Enter selection [1/2]: ").strip()

        if choice == "2":
            username, token_code, authorization = asyncio.run(capture_credentials_via_browser())
            if not (username and token_code and authorization):
                print("\n⚠️ Incomplete credentials captured from browser. Enter manually:")
                username, token_code, authorization = prompt_manual_input(
                    default_username=username,
                    default_tokencode=token_code,
                    default_auth=authorization
                )
        else:
            username, token_code, authorization = prompt_manual_input(
                default_username=args.username or "",
                default_tokencode=args.tokencode or "",
                default_auth=args.authorization or ""
            )

        if username and token_code and authorization:
            update_env_file(username, token_code, authorization)
        else:
            print("❌ Operation cancelled: All 3 credentials (Username, TokenCode, Authorization) are required.")
        return

    # Case 4: Non-interactive fallback
    username, token_code, authorization = prompt_manual_input(
        default_username=args.username or "",
        default_tokencode=args.tokencode or "",
        default_auth=args.authorization or ""
    )
    if username and token_code and authorization:
        update_env_file(username, token_code, authorization)

if __name__ == "__main__":
    main()
