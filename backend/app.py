from flask import Flask, jsonify, request
import os


def create_app(config=None):
	"""Return a minimal Flask application."""
	app = Flask(__name__)
	if config:
		app.config.update(config)

	@app.route("/")
	def index():
		return jsonify({"status": "ok", "message": "JobGenie backend running"})

	@app.route("/health")
	def health():
		return jsonify({"status": "healthy"})

	@app.route("/echo", methods=["POST"])
	def echo():
		return jsonify({"received": request.get_json(silent=True)})

	return app


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "5000"))
	debug = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
	create_app().run(host="0.0.0.0", port=port, debug=debug)
