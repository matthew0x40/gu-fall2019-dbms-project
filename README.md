# gu-fall2019-dbms-project

Requires at least Node v10. After cloning the repository run `npm install` to install dependencies.

Run `node index.js` to start the web application server locally (deploys to localhost:5000).
Type `Ctrl + C` in terminal to stop server. You will need to stop and restart the server if you
make changes to any code.

Alternatively you can install Nodemon (via `npm install -g nodemon`) and then run `nodemon index.js`
which will hot-reload the server without needing to manually restart.

The project is deployed to gu-fall2019-dbms-project.herokuapp.com. Any pushes to this repository will
automatically deploy to Heroku.

## Setup

  1. Clone the repo
  2. Run `npm install`
  3. Copy `.env.example` to just `.env` and paste in MySQL connection string
  
## Run

  - Run `npm index.js` to start node server (type Ctrl+C to stop server)
  - Run `nodemon index.js` to start node server with hot-reloading
      - Requires `nodemon` to be installed, run `npm install -g nodemon` to install nodemon.