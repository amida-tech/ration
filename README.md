Ration [![Dependency Status](https://david-dm.org/jsachs/ration/status.svg?style=flat)](https://david-dm.org/jsachs/ration) [![Build Status](https://circleci.com/gh/jsachs/ration.png?circle-token=903c4db5360a4ad7fd73acb866dfdc990d22fc63)](https://circleci.com/gh/jsachs/ration)
=======================

Ration is a tool for managing workload within your organization. Users can login using your organization's Gmail domain, then set their total weekly hours on a per-project basis.
These hours are visible to all users in a dashboard.

Prerequisites
-------------

- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js](http://nodejs.org)

Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/jsachs/ration.git myproject

# Change directory
cd myproject

# Install NPM dependencies
npm install

# Create a .env file from the template
cp .env.example .env

# With MongoDB running
node app.js
```

Obtaining Google API Keys
------------------

- Visit [Google Cloud Console](https://cloud.google.com/console/project)
- Click on the **Create Project** button
- Enter *Project Name*, then click on **Create** button
- Then click on *APIs & auth* in the sidebar and select *API* tab
- Click on **Google+ API** under *Social APIs*, then click **Enable API**
- Next, under *APIs & auth* in the sidebar click on *Credentials* tab
- Click on **Create new Client ID** button
- Select *Web Application* and click on **Configure Consent Screen**
- Fill out the required fields then click on **Save**
- In the *Create Client ID* modal dialog:
 - **Application Type**: Web Application
 - **Authorized Javascript origins**: http://localhost:3000
 - **Authorized redirect URI**: http://localhost:3000/auth/google/callback
- Click on **Create Client ID** button
- Copy and paste *Client ID* and *Client secret* keys into `.env`

**Note:** When you ready to deploy to production don't forget to
add your new url to *Authorized Javascript origins* and *Authorized redirect URI*,
e.g. `http://my-awesome-app.herokuapp.com` and
`http://my-awesome-app.herokuapp.com/auth/google/callback` respectively.
The same goes for other providers.

Deployment
----------

The easiest way to deploy Ration is on Heroku. You can use the deploy button to instantly deploy an application alongside an mLab MongoDB instance.
The button draws on the settings in the `app.json` file in this repository.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Contributing
------------
See issues at https://github.com/jsachs/ration/issues.

License
-------

The MIT License (MIT)

Copyright (c) 2016 Jacob Sachs

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
