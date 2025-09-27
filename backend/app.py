from flask import Flask, jsonify, request
import json
import os
from google import genai
from GeminiRecipe.GeminiRecipe import Recipe


"""config={
        			"response_mime_type": "application/json",
        			"response_schema": list[Recipe],
    },"""

def create_app(config=None):
	"""Create and return a minimal Flask app with a genai client."""
	app = Flask(__name__)

	# Apply optional configuration
	if config:
		app.config.update(config)

	# Initialize the genai client, prefer explicit API key env vars if provided.
	api_key=os.environ['GOOGLE_API_KEY']
	if api_key:
		client = genai.Client(api_key=api_key)
	else:
		print("No Active GOOGLE_API_KEY found; genai client not created.")
		exit(0)

	@app.route("/")
	def index():
		"""Call the model and return a short response (with basic error handling)."""
		try:
			query="Pick a random number between 1 and 10, inclusive. Don't return anything else."
			response = client.models.generate_content(
    			model="gemini-2.5-pro",
    			contents=query)
			text = getattr(response, "text", None) or str(response)
			return jsonify({"response": text})
		except Exception as e:
			print("Error calling genai model:", e)
			return jsonify({"error": str(e)}), 500

	@app.route("/health")
	def health():
		return jsonify({"status": "healthy"})

	@app.route("/pushUserData", methods=["GET", "POST"])
	def processUserData():
		#desired_jobs = request.form.get('desired_jobs', '')
		#job_type = request.form.get('job_type', '')
		#education_level = request.form.get('education_level', '')

		#query=f"Given the attached resume,  desired jobs: {desired_jobs}, job type: {job_type}, and education level: {education_level}, provide a detailed analysis of strengths, areas for improvement, a rating from 0 to 10, and next steps for career development."
		query= "Fill out the following schema based on a hallucinated resume and profile."
		response = client.models.generate_content(
    		model="gemini-2.5-pro",
    		contents=query,
    		config={
       			"response_mime_type": "application/json",
        		"response_schema": list[Recipe],
    },
)
		parsed = json.loads(response.text)
		return jsonify({"response" : parsed})
		#get resume

		#prompt to gemini using above data

	return app


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "5000"))
	debug = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
	create_app().run(host="0.0.0.0", port=port, debug=debug)
