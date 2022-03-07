const auth0 = require('auth0-deploy-cli')

const config = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_ALLOW_DELETE: true,
  AUTH0_API_MAX_RETRIES: 10,
  AUTH0_KEYWORD_REPLACE_MAPPINGS: {
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
  }
};

// Import tenant config
auth0.deploy({
  input_file: './src/auth0/src', // Input file for directory, change to .yaml for YAML
  config, // Option to sent in json as object
})
  .then(() => console.log('To boldly go, where no one has gone before! 😎 😍 🚀 💯'))
  .catch(err => {
    console.log(`It is possible to commit no mistakes and still lose. That is not weakness, that is life. 🙊🙊 Error: ${err}`)
    process.exit(1)
  });
