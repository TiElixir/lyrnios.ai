import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

try:
    from models import UserBase
    from auth import create_access_token
    print("Imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
