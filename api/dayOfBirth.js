'use strict';

let moment = require('moment');

module.exports.submit = (event, context, callback) => {

  let ageCalcRequest = event.queryStringParameters;
  let dob = ageCalcRequest.dob;
  

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      day: moment(dob, 'YYYYMMDD').format('dddd')
    }),
  };

  callback(null, response);

};
