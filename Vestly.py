"""
Vestly - ESOP Management & Research Platform Launcher
This script provides a 1-click launcher to run the Vestly Next.js server
and open the application in your default web browser.
"""

import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 65)
    print("           Vestly — ESOP Management & Research Platform")
    print("=" * 65)
    print("\n[1/3] Checking environment...")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    # Check if dev.db exists, otherwise seed
    db_file = os.path.join(base_dir, "dev.db")
    if not os.path.exists(db_file):
        print("  → Initializing local SQLite database & demo data...")
        subprocess.run(["npx", "prisma", "db", "push"], shell=True, check=True)
        subprocess.run(["node", "prisma/seed.js"], shell=True, check=True)
    else:
        print("  ✔ Database ready (dev.db found)")

    print("\n[2/3] Starting Vestly Next.js Application Server...")
    print("  → Port: http://localhost:3000")
    print("  → Press Ctrl+C in this terminal to stop the server\n")

    # Start dev server
    server_process = subprocess.Popen(["npm", "run", "dev"], shell=True)

    # Wait a few seconds and open browser
    time.sleep(3)
    print("[3/3] Opening browser at http://localhost:3000 ...")
    try:
        webbrowser.open("http://localhost:3000")
    except Exception as e:
        print(f"  Note: Could not automatically open browser ({e}). Please visit http://localhost:3000 manually.")

    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\nStopping Vestly server...")
        server_process.terminate()
        print("Server stopped. Goodbye!")

if __name__ == "__main__":
    main()

