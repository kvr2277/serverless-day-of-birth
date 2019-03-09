'use strict';

let moment = require('moment');
let fetch = require('node-fetch');

module.exports.submit = async (event, context, callback) => {

  let ageCalcRequest = event.queryStringParameters;
  let dob = ageCalcRequest.dob;
  let resp = await fetchAge(dob).then(resp => {return resp});

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      day: moment(dob, 'YYYYMMDD').format('dddd'),
      age: resp.age
    }),
  };

  callback(null, response);
};

async function fetchAgeNoSecuirty(dob) {
  return new Promise((resolve, reject) => {
    
      //change your URL below
      let url = 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/age?dob=' + dob;
      fetch(url, {
              method: 'GET',
              headers: {
            Accept: 'application/json'
        }})
          .then(res => {
              if (res.ok) {
                  res.text().then(function(text) {
                      resolve(text ? JSON.parse(text) : {});
                  });
              } else {
                  console.log('looks like the response was not perfect, got status' + res.status);
                  reject('request failed ', res.statusText);
              }
          }, function(e) {
              console.log('fetch failed!', e);
              reject('fetch failed ', e);
          });
  });
}


async function fetchAge(dob){
  let resp, err;
  let Security = require('./utils/Security');
  await to(Security.login('test@example.com', 'Passw0rd!'));

   [err, resp] = await to(Security.invokeApig('https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev',
    '/age', 
    'GET', 
    {Accept: 'application/json'}, 
    {dob: dob}));

  return resp;

}

function to(promise) {
  return promise.then(data => {
      console.log('data is '+JSON.stringify(data));
      return [null, data];
  })
      .catch(err => [err]);
}
