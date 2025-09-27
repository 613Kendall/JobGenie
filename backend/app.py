from flask import Flask, jsonify, request
import os
import google.generativeai as genai

def create_app(config=None):
	"""Create and return a minimal Flask app with a genai client."""
	app = Flask(__name__)

	# Apply optional configuration
	if config:
		app.config.update(config)

	# Initialize the genai client, prefer explicit API key env vars if provided.
	api_key=os.environ['GOOGLE_API_KEY']
	if api_key:
		genai.configure(api_key=api_key)
		model = genai.GenerativeModel(model_name='gemini-2.5-pro')
	else:
		print("No Active GOOGLE_API_KEY found; genai client not created.")
		exit(0)

	@app.route("/")
	def index():
		"""Call the model and return a short response (with basic error handling)."""
		try:
			query="Pick a random number between 1 and 10, inclusive. Don't return anything else."
			response = model.generate_content(query)
			text = getattr(response, "text", None) or str(response)
			return jsonify({"response": text})
		except Exception as e:
			print("Error calling genai model:", e)
			return jsonify({"error": str(e)}), 500

	@app.route("/health")
	def health():
		return jsonify({"status": "healthy"})

	@app.route("/pushUserData", methods=["POST"])
	def processUserData():
		desired_jobs = request.form.get('desired_jobs', '')
		job_type = request.form.get('job_type', '')
		education_level = request.form.get('education_level', '')
		#get resume

		#prompt to gemini using above data


		return jsonify({"received": request.get_json(silent=True)})

	return app


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "5000"))
	debug = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
	create_app().run(host="0.0.0.0", port=port, debug=debug)
