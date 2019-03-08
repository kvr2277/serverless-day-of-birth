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

async function fetchAge(dob) {
  return new Promise((resolve, reject) => {
    
      let url = 'https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/age?dob=' + dob;
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
