# Backend

This repository contains the JobGenie frontend and a minimal Flask backend located in `backend/`.

Setup and run (macOS / zsh)

1. Create a Python virtual environment (recommended inside `backend/`):

```bash
cd backend
python3 -m venv env
```

2. Activate the virtual environment:

```bash
source env/bin/activate
```

3. Install required Python packages from `requirements.txt` (create one if missing):

```bash
pip install -r requirements.txt
```

4. Run the Flask backend using the Flask CLI. The app exposes a factory `create_app` in `backend/main.py` so we tell Flask how to call it:

```bash
# from backend/ with the virtualenv active
export FLASK_APP=main:create_app
export FLASK_ENV=development   # optional: enables debug auto-reload
flask run --host=0.0.0.0 --port=5000
```

Notes
- If you prefer to run the module directly, you can also do:

```bash
python main.py
```

- Ensure `requirements.txt` includes `Flask` (for example: `Flask>=3.0`).

- To stop the server press Ctrl+C.

