from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import time
from datetime import date
import io
from google import genai
from GeminiRecipe.GeminiRecipe import Recipe, JobRecipe
import requests
import random


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
		# Load in database from cloud into a Python dictionary
		try:
			resp = requests.get('https://python-d1.willstabile.workers.dev/')
			resp.raise_for_status()
			JOBS_DB = resp.json()
			print("Loaded remote DB successfully.")
			print(f"DB Sample: {JOBS_DB}")
		except Exception as e:
			print(f"Warning: Could not load remote DB: {e}")
			loaded_db = {}
			exit(0)
	else:
		print("No Active GOOGLE_API_KEY found; genai client not created.")
		exit(0)

	@app.route("/")
	def index():
		return jsonify({"status": "ok", "code": 200})

	@app.route("/health")
	def health():
		return jsonify({"status": "healthy"})

	@app.route("/jobs/search", methods=["POST"])
	def getJobs():
		desired_jobs = request.form.get('desired_jobs', 'Software Engineer')
		job_type = request.form.get('job_type', 'full_time')
		education_level = request.form.get('education_level', 'freshman')
		query = f"""Based on the available jobs listed here {JOBS_DB}, and the candidate's career goals:
		- Desired job position: {desired_jobs}
		- Employment type preference: {job_type}
		- Education level: {education_level}
		return jobs that match the candidate's profile and preferences."""

		try:
			response = client.models.generate_content(
					model="gemini-2.5-pro",
					contents= [query],
					config={
						"response_mime_type": "application/json",
						"response_schema": list[JobRecipe],
					},
				)
			parsed = json.loads(response.text)
			return jsonify(parsed)
		
		except Exception as e:
			print(f"Error calling Gemini API: {e}")
			import traceback
			traceback.print_exc()
			return jsonify({"error": str(e)}), 500

	@app.route("/api/jobs/search", methods=["POST"])
	def search_jobs():
		try:
			# Get search parameters from request
			request_data = request.get_json()
			desired_jobs = request_data.get('desiredJobs', '').lower()
			employment_type = request_data.get('employmentType', 'both')
			year_in_school = request_data.get('yearInSchool', '')
			
			print(f"Job search request - Desired: {desired_jobs}, Type: {employment_type}, Year: {year_in_school}")
			
			# Fetch jobs from the external API
			jobs_response = requests.get('https://python-d1.willstabile.workers.dev/')
			if jobs_response.status_code != 200:
				return jsonify({"error": "Failed to fetch jobs"}), 500
			
			jobs_data = jobs_response.json()
			
			# Transform and filter jobs
			all_jobs = []
			preferred_jobs = []
			
			for job in jobs_data:
				# Skip jobs with type "ignore"
				if job.get('type') == 'ignore':
					continue
				
				# Calculate match score based on desired jobs
				match_score = calculate_match_score(job, desired_jobs)
				
				# Map job type
				job_type = map_job_type(job.get('type', ''))
				
				# Transform job to match frontend interface
				transformed_job = {
					"id": str(job.get('id', '')),
					"title": job.get('title', ''),
					"company": job.get('company', ''),
					"location": "Remote", # Default since location isn't provided
					"type": job_type,
					"salary": "Competitive", # Default since salary isn't provided
					"posted": job.get('opening', ''),
					"matchScore": match_score,
					"description": job.get('description', '').strip() or f"Great opportunity at {job.get('company', 'this company')}",
					"requirements": extract_requirements(job.get('title', '')),
					"link": job.get('link', '')
				}
				
				# Add to appropriate list
				all_jobs.append(transformed_job)
				
				# Check if job matches employment type preference
				type_match = (employment_type == 'both' or 
							(employment_type == 'internship' and job_type == 'Internship') or
							(employment_type == 'full-time' and job_type == 'Full-time'))
				
				if type_match:
					preferred_jobs.append(transformed_job)
			
			# Sort all jobs by match score
			all_jobs.sort(key=lambda x: x['matchScore'], reverse=True)
			preferred_jobs.sort(key=lambda x: x['matchScore'], reverse=True)
			
			# Strategy: Try to return preferred jobs first, but ensure minimum count
			result_jobs = []
			
			# Start with preferred jobs (matching employment type)
			if preferred_jobs:
				result_jobs = preferred_jobs[:15]  # Take top 15 preferred jobs
			
			# If we don't have enough jobs, add from all jobs
			if len(result_jobs) < 10:
				# Add jobs from all_jobs that aren't already in result_jobs
				existing_ids = {job['id'] for job in result_jobs}
				for job in all_jobs:
					if job['id'] not in existing_ids:
						result_jobs.append(job)
						if len(result_jobs) >= 15:  # Cap at 15 total
							break
			
			# If still not enough, lower the bar further and include any job
			if len(result_jobs) < 5:
				print(f"Warning: Only found {len(result_jobs)} jobs, including lower-scored jobs")
				# Reset and take any jobs, regardless of type matching
				result_jobs = all_jobs[:20]  # Take top 20 regardless of filters
			
			# Ensure minimum match scores aren't too low for display
			for job in result_jobs:
				if job['matchScore'] < 30:
					job['matchScore'] = max(30, job['matchScore'])  # Boost very low scores to at least 30
			
			print(f"Returning {len(result_jobs)} jobs")
			return jsonify(result_jobs)
			
		except Exception as e:
			print(f"Error in job search: {e}")
			import traceback
			traceback.print_exc()
			return jsonify({"error": str(e)}), 500

	def calculate_match_score(job, desired_jobs):
		"""Calculate a match score based on job title and desired jobs"""
		title = job.get('title', '').lower()
		company = job.get('company', '').lower()
		
		# Base score - more generous starting point
		score = 50
		
		# Check for keyword matches in title
		if desired_jobs:
			desired_keywords = desired_jobs.split()
			for keyword in desired_keywords:
				keyword = keyword.lower().strip()
				if len(keyword) > 2:  # Ignore very short keywords
					if keyword in title:
						score += 20  # Higher bonus for title matches
					elif keyword in company:
						score += 15  # Good bonus for company matches
					elif any(keyword in word for word in title.split()):
						score += 10  # Partial word matches
		
		# General tech-related bonuses
		tech_terms = ['software', 'engineer', 'developer', 'programmer', 'tech', 'computer', 'data', 'analyst']
		for term in tech_terms:
			if term in title:
				score += 8
				break  # Only apply this bonus once
		
		# Bonus for internships if title contains "intern"
		if 'intern' in title:
			score += 12
		
		# Bonus for entry level or new grad positions
		entry_terms = ['entry', 'junior', 'new grad', 'graduate', 'early career', 'associate', 'i ', ' i', 'level i']
		for term in entry_terms:
			if term in title:
				score += 10
				break
		
		# Bonus for well-known companies
		top_companies = ['microsoft', 'google', 'amazon', 'meta', 'apple', 'tesla', 'nvidia', 'citadel', 'stripe', 
		                'spotify', 'uber', 'airbnb', 'netflix', 'adobe', 'salesforce', 'oracle', 'ibm']
		if company in top_companies:
			score += 15
		
		# Additional bonus for other known tech companies
		other_tech = ['workiva', 'roblox', 'linkedin', 'spacex', 'blue origin', 'hudson river trading']
		if company in other_tech:
			score += 10
		
		# Bonus for recent postings
		opening = job.get('opening', '').lower()
		if 'sep' in opening or 'september' in opening:
			score += 5
		
		# Ensure minimum reasonable score
		score = max(score, 40)
		
		# Cap at 100
		return min(score, 100)

	def map_job_type(job_type):
		"""Map job type from API to frontend format"""
		if job_type == 'intern':
			return 'Internship'
		else:
			return 'Full-time'

	def extract_requirements(title):
		"""Extract likely requirements based on job title"""
		title_lower = title.lower()
		requirements = []
		
		# Programming languages
		if any(term in title_lower for term in ['software', 'engineer', 'developer', 'programming']):
			requirements.extend(['Programming skills', 'Problem solving'])
		
		if 'python' in title_lower:
			requirements.append('Python')
		if 'java' in title_lower:
			requirements.append('Java')
		if 'c++' in title_lower:
			requirements.append('C++')
		if 'rust' in title_lower:
			requirements.append('Rust')
		if 'fullstack' in title_lower or 'full-stack' in title_lower:
			requirements.extend(['Frontend development', 'Backend development'])
		if 'frontend' in title_lower or 'front-end' in title_lower:
			requirements.extend(['HTML/CSS', 'JavaScript', 'React'])
		if 'backend' in title_lower or 'back-end' in title_lower:
			requirements.extend(['APIs', 'Databases'])
		if 'ml' in title_lower or 'machine learning' in title_lower or 'ai' in title_lower:
			requirements.extend(['Machine Learning', 'Statistics', 'Python'])
		if 'data' in title_lower:
			requirements.extend(['Data Analysis', 'SQL'])
		if 'security' in title_lower:
			requirements.extend(['Cybersecurity', 'Risk Assessment'])
		if 'cloud' in title_lower:
			requirements.extend(['AWS', 'Cloud Computing'])
		
		# Default requirements
		if not requirements:
			requirements = ['Strong communication skills', 'Team collaboration', 'Problem solving']
		
		# Add education requirement for non-intern positions
		if 'intern' not in title_lower:
			requirements.append("Bachelor's degree or equivalent")
		else:
			requirements.append("Currently enrolled in relevant degree program")
		
		return requirements

	@app.route("/pushUserData", methods=["POST"])
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
		- Desired job position: {desired_jobs}
		- Employment type preference: {job_type}
		- Education level: {education_level}

		Provide a comprehensive resume analysis with:
		1. Strengths - identify key strengths relevant to their desired positions
		2. Areas for improvement - specific actionable improvements
		3. Overall rating from 0-10 considering their target role and education level
		4. Next steps for career development in their desired field

		Today's date is {date.today()} for context.

		Format the response as a JSON object matching the provided schema."""

		try:
			#create the file temporarily, then upload to Gemini
			tempFileName = "temp_resume" + str(random.randint(1,9999)) + ".pdf"
			with open(tempFileName, "wb") as f:
				f.write(pdf_content)
			f.close()

			pdf_file = client.files.upload(file=tempFileName)
			

			# Create the content with both the PDF and text prompt
			response = client.models.generate_content(
				model="gemini-2.5-pro",
				contents=[pdf_file, query],
				config={
					"response_mime_type": "application/json",
					"response_schema": list[Recipe],
				},
			)
			
			# Clean up the uploaded file
			try:
				client.files.delete(name=pdf_file.name)
				print("Temporary file cleaned up")
			except Exception as cleanup_error:
				print(f"Warning: Could not delete temporary file from Gemini: {cleanup_error}")
			
			if os.path.exists(tempFileName):
				os.remove(tempFileName)
			
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
