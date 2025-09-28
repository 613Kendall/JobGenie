from workers import WorkerEntrypoint, Response
from urllib.parse import urlparse, parse_qs
import json
from pyodide.ffi import to_js


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        if request.method == "GET":
          parsed_url = urlparse(request.url)
          query_params = parse_qs(parsed_url.query)
          query = "SELECT * FROM jobs WHERE 1=1"
          params = []
          if (query_params.get('title')):
            query += " AND title = ?"
            params.append(query_params.get('title')[0])
          if (query_params.get('type')):
            query += " AND type = ?"
            params.append(query_params.get('type')[0])
          if (query_params.get('company')):
            query += " AND company = ?"
            params.append(query_params.get('company')[0])
          if (query_params.get('opening')):
            query += " AND opening = ?"
            params.append(query_params.get('opening')[0])
          if (query_params.get('desc')):
            query += " AND description LIKE ?"
            params.append(f"%{query_params.get('desc')[0]}%")
          try:
              results = await self.env.DB.prepare(query).bind(*params).run()
              data = results.results
              # Return a JSON response
              return Response.json(data)
           except Exception as e:
               return Response.new("Error Retrieving Jobs")
        
        elif request.method == "POST":
          for item in data:
            title = item["title"]
            type = item["type"]
            company = item["company"]
            link = item["url"]
            description = item["description"]
            opening = item["opening"]
            try:
                await self.env.DB.prepare("INSERT INTO jobs (title, type, company, link, description, opening) VALUES (?, ?, ?, ?, ?, ?)").bind(title, type, company, link, description, opening).run()
                return Response.new("Jobs added successfully!", status=200)
            except Exception as e:
                return Response.new("Error Inserting jobs", status=403)
