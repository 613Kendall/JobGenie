## Demo Video

https://www.youtube.com/watch?v=Dd6TelzEJ3I&t=1s

## Inspiration
We wanted to make the job hunt less overwhelming. Resumes are often the first impression, but knowing whether yours is strong enough—and how to improve it—can feel like guesswork. We set out to build an AI-powered “genie in a bottle” that gives personalized resume feedback and recommends jobs that match your background and goals.  

## What it does
JobGenie takes a PDF resume as input, then uses AI to evaluate it. Users select their education level, desired job roles, and job types (full-time, part-time, etc.). Our system analyzes the resume with Gemini, highlights strengths, points out areas to improve, and gives a tailored score. It also recommends practical next steps and shows relevant job postings scraped from the web.  

## How we built it
We built the frontend with **React** for a clean, interactive user experience. The backend is powered by **Flask**, which handles resume uploads, processing, and communication with **Gemini**. We used **Cloudflare D1** as our database to store user preferences and results. For job recommendations, we used **web scraping** to pull in live job listings. The entire system is tied together so that users can seamlessly upload, review, and get actionable insights.  

## Challenges we ran into
- Parsing resumes consistently from different PDF formats.  
- Balancing Gemini’s analysis to be both specific and generalizable.  
- Scraping job data reliably without hitting rate limits or inconsistent formats.  
- Integrating multiple moving parts (React, Flask, D1, AI, scraping) into a smooth pipeline.  

## Accomplishments that we're proud of
- Creating a working prototype that goes beyond just “AI scoring” and actually suggests actionable next steps.  
- Successfully connecting AI insights with real-world job listings.  
- Building an end-to-end system in a short timeframe with multiple technologies working together.  

## What we learned
- How to integrate large language models (Gemini) into a real-world workflow.  
- The importance of data cleaning and consistency, especially with resumes and job listings.  
- Cloudflare D1’s potential as a lightweight and fast solution for handling app data.  
- The value of keeping the user experience simple, even when the backend is complex.  

## What's next for JobGenie
- Expanding job recommendation coverage to more industries and locations.  
- Adding support for multi-page resume parsing and LinkedIn profile imports.  
- Training custom prompts/models to provide even more tailored resume feedback.  
- Building out user dashboards so job seekers can track improvements over time.  
- Partnering with job boards and career platforms for more seamless job applications.  
