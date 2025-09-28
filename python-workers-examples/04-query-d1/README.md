## How to Run

First ensure that you have a cloudflare d1 database:
`npx wrangler d1 create mydb`
`npx wrangler d1 info mydb`

Now, create the job table by running:
`npx wrangler d1 execute mydb --command="CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, title TEXT NOT NULL,  type TEXT NOT NULL, company TEXT NOT NULL, link TEXT NOT NULL, description TEXT NOT NULL, opening TEXT NOT NULL);"`

You can also run `npx wrangler deploy` to deploy the database.

In the wrangler.toml file, change database_name and database_id accordingly:
`database_name = "<YOUR-DB-NAME>"`
`database_id = "<YOUR-DB-ID>" # REPLACE WITH YOUR DB ID`

