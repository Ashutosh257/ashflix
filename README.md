

# Adding ENV variables on Netlify

The website is hosted [here](https://ashflix.netlify.app/)

```diff
- This documentation assumes that you have hosted your project on Netlify
```

### Step 0: Add Environment variable on Netlify console
Follow instructions on https://docs.netlify.com/environment-variables/overview/

#### Make sure you define and use the same environment variable name in your code!

### Step 1: Install Netlify CLI 

> npm install netlify-cli -g

### Step 2 : Login with Netlify

This command will open a browser window, asking you to log in with Netlify and grant access to Netlify CLI.

> netlify login

Once authorized, Netlify CLI stores your access token in a config.json global configuration file. The Netlify CLI uses the token in this file automatically for all future commands.

### Step 3: Create serverless functions with Netlify 

Netlify can create serverless functions for you locally as part of Netlify Functions with the `functions:create` command:

> netlify functions:create

1. Choose the 2nd option - `Serverless function (Node/Go/Rust)`
Use arrow keys to select the option.
![Create serverless function](./assets/readme/step%20a.png)

2. Next, it will ask you where to keep the serverless function i.e. the path. Press enter for the default path, i.e. `netlify/functions`
![Set function path](./assets/readme/step%20b.png)

1. Choose the language you want to write your serverless function in.
    (I have chosen Javascript)
![Choose language for  serverless function](./assets/readme/step%20c.png)


4. Choose the basic template 
   `[hello-world] Basic function that shows async/await usage, and response formatting`
![Choose basic boilerplate code](./assets/readme/step%20d.png)

1. Give a name for your function (I have used `fetchEnvVariables`, you can give anything else as well but make sure it follows the javascript naming conventions)


6. You will get the following boilerplate code :
```
// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event) => {
  try {
    const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello ${subject}` }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

```
Please do not change the name of the function `handler` to anything else, it won't work.
It's like the entrypoint of the file.  

Step 4: Changes to the serverless function

`In index.js `

```
// Make changes to the url according to your details inside the [] (square brackets)
const url = `https://[YOUR_HOSTED_WEBSITE_URL_ON_NETLIFY]/.netlify/functions/[SERVERLESS_FUNCTION_NAME]/?param1=${value}&param2=${param2}`

// It should look something like this in the end
const url = `https://ashflix.netlify.app/.netlify/functions/fetchEnvVariables/?title=${inputEl.value}`
    
```

`Serverless function code:`

```
// you can access the env variable defined on Netlify using 
// process.env.YOUR_ENVIRONMENT_VARIABLE_NAME_DEFINED_ON_NETLIFY

const apiKey = process.env.MY_API_KEY <-- this line will change according to the env variable defined by you

const handler = async (event) => {
    
    // You can check the `event` and write the logic accordingly
    // console.log(event)

    try {
        // we can extract the query parameters from "event.queryStringParameters.param1"
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${event.queryStringParameters.title}`

        const res = await fetch(url)
        const data = await res.json()

        return {
            statusCode: 200,
            body: JSON.stringify({ data: data }) // make changes here to get the data in the form you want!
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }
```

### STEP 4: Push to GitHub 
Once you push to Github wait for the changes to happen!

If you get stuck! Check out - [this repo](https://github.com/Ashutosh257/ashflix)


## Voila! You can now use your API Keys or any Environment variables without exposing it to the Internet!!