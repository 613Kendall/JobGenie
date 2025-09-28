from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import time
import io
from google import genai
from GeminiRecipe.GeminiRecipe import Recipe
import requests


"""config={
        			"response_mime_type": "application/json",
        			"response_schema": list[Recipe],
    },"""

def create_app(config=None):
	"""Create and return a minimal Flask app with a genai client."""
	app = Flask(__name__)
	CORS(app)

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
		return jsonify({"status": "ok", "code": 200})

	@app.route("/health")
	def health():
		return jsonify({"status": "healthy"})

	@app.route("/jobs")
	def jobs():
		jobs = requests.get('https://python-d1.willstabile.workers.dev/')
		return jobs.text

	@app.route("/pushUserData", methods=["GET", "POST"])
	def processUserData():
		
		# 1. Handle the PDF from request body
		pdf_content = None
		if request.method == 'POST' and request.data:
			pdf_content = request.data
			print(f"Received PDF resume of size {len(pdf_content)} bytes")
		else:
			print("No PDF resume provided in request body")
			return jsonify({"error": "No resume file provided"}), 400

		# 2. Extract job parameters from query parameters
		desired_jobs = request.args.get('desired_jobs', 'Software Engineer')
		job_type = request.args.get('job_type', 'full_time')
		education_level = request.args.get('education_level', 'freshman')
		
		print(f"Desired Jobs: {desired_jobs}")
		print(f"Job Type: {job_type}")
		print(f"Education Level: {education_level}")

		# Create a comprehensive prompt for Gemini
		query = f"""Based on the attached resume, analyze the candidate's profile considering their career goals:
		- Desired job positions: {desired_jobs}
		- Employment type preference: {job_type}
		- Education level: {education_level}

		Provide a comprehensive resume analysis with:
		1. Strengths - identify key strengths relevant to their desired positions
		2. Areas for improvement - specific actionable improvements
		3. Overall rating from 0-10 considering their target roles
		4. Next steps for career development in their desired field

		Format the response as a JSON object matching the provided schema."""

		try:
			# First, upload the PDF to Gemini Files API
			print("Uploading PDF to Gemini Files API...")
			
			# Create a temporary file-like object from the PDF bytes
			import io
			pdf_file_obj = io.BytesIO(pdf_content)
			
			# Upload the PDF file to Gemini
			uploaded_file = client.files.upload(
				file=pdf_file_obj,
			)
			print(f"PDF uploaded successfully. File URI: {uploaded_file.uri}")

			# Wait for the file to be processed
			while uploaded_file.state.name == "PROCESSING":
				print("Waiting for file processing...")
				time.sleep(2)
				uploaded_file = client.files.get(uploaded_file.name)
			
			if uploaded_file.state.name == "FAILED":
				raise Exception("PDF processing failed")

			print(f"File processing complete. State: {uploaded_file.state.name}")

			# Create the content with both the PDF and text prompt
			response = client.models.generate_content(
				model="gemini-2.5-pro",
				contents=[uploaded_file, query],
				config={
					"response_mime_type": "application/json",
					"response_schema": list[Recipe],
				},
			)
			
			# Clean up the uploaded file
			try:
				client.files.delete(uploaded_file.name)
				print("Temporary file cleaned up")
			except Exception as cleanup_error:
				print(f"Warning: Could not delete temporary file: {cleanup_error}")
			
			# Parse the response and format it for the frontend
			parsed = json.loads(response.text)
			if parsed and len(parsed) > 0:
				first_analysis = parsed[0]
				formatted_response = {
					"overallRating": first_analysis.get("rating", 8),
					"ratingCategory": get_rating_category(first_analysis.get("rating", 8)),
					"strengths": first_analysis.get("strengths", []),
					"improvements": first_analysis.get("improvements", []),
					"nextSteps": first_analysis.get("next_steps", [])
				}
				return jsonify(formatted_response)
			else:
				return jsonify({"error": "No analysis data received"}), 500
				
		except Exception as e:
			print(f"Error calling Gemini API: {e}")
			import traceback
			traceback.print_exc()
			return jsonify({"error": str(e)}), 500

	def get_rating_category(rating):
		"""Convert numeric rating to category string"""
		if rating >= 9:
			return "Excellent Resume"
		elif rating >= 8:
			return "Strong Resume"
		elif rating >= 7:
			return "Good Resume"
		elif rating >= 6:
			return "Fair Resume"
		else:
			return "Needs Improvement"

	return app


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "5000"))
	debug = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
	create_app().run(host="0.0.0.0", port=port, debug=debug)
