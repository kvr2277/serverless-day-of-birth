//@ts-check

let {sigV4Client} = require('./SigV4Client');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
let AWS = require('aws-sdk');

module.exports = {
    login,
    invokeApig,
  };


function login(username, password) {
    const userPool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID
    });
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: username, Pool: userPool });
    const authenticationData = { Username: username, Password: password };
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  
    return new Promise((resolve, reject) =>
      user.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(),
        onFailure: err => {
          console.log('err is ', err);
          reject(err)}
      })
    );
  }

  function getUserToken(currentUser) {
    return new Promise((resolve, reject) => {
      currentUser.getSession(function(err, session) {
        if (err) {
          reject(err);
          return;
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }

  function getCurrentUser() {
    const userPool = new AmazonCognitoIdentity.CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID
    });
    return userPool.getCurrentUser();
  }


  function getAwsCredentials(userToken) {
    const authenticator = "cognito-idp." + process.env.COGNITO_REGION + ".amazonaws.com/" + process.env.COGNITO_USER_POOL_ID;
    AWS.config.update({ region: process.env.COGNITO_REGION });
    //console.log('userToken '+userToken);
  
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
      Logins: {
        [authenticator]: userToken
      }
    });
  
    return AWS.config.credentials.getPromise();
  }


 async function invokeApig(endpoint, 
    path,
    method,
    headers,
    queryParams,
    body
  ) {
  
    
    const currentUser = getCurrentUser();
    //console.log('current user is '+JSON.stringify(currentUser));
  
    const userToken = await getUserToken(currentUser);  
    await getAwsCredentials(userToken);
  
    //console.log('accessKeyId '+AWS.config.credentials.accessKeyId);
    //console.log('secretAccessKey '+AWS.config.credentials.secretAccessKey);
    //console.log('sessionToken '+AWS.config.credentials.sessionToken);

    const signedRequest = sigV4Client
      .newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: process.env.API_GATEWAY_REGION,
        endpoint: endpoint
      })
      .signRequest({
        method,
        path,
        headers,
        queryParams,
        body
      });
  
    body = body ? JSON.stringify(body) : body;
    headers = signedRequest.headers;
  
    const results = await fetch(signedRequest.url, {
      method,
      headers,
      body
    });
  
    //console.log('results : '+JSON.stringify(results));
    if (results.status !== 200) {
      throw new Error(await results.text());
    }
  
    return results.json();
  }

