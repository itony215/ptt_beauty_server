const config = require('../../config');

function issueEmail(options) {
  const { senderTitle, subject, receiverMail, htmlContent } = options;
  console.warn('issueEmail', options);
  let body = {
    senderTitle,
    senderEmail: 'cs@sun2u.com',
    toEmails: receiverMail,
    subject,
    htmlContent,
  }
  if (options.headers && options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    const urlEncodedrequest = [];
    for (const key in body) {
      urlEncodedrequest.push(`${key}=${encodeURIComponent(body[key])}`);
    }
    const requestForm = urlEncodedrequest.reduce((pre, cur) => `${pre}&${cur}`);
    body = requestForm;
  }
  return fetch(`${options.SERVICE_HOST}`, {
    method: 'POST',
    body,
    headers: Object.assign({}, {
      'Authorization': 'Test',
    }, options.headers),
  }).then((response) => {
    return response.json();
  })
}

function issueSMS(toPhone, text, options) {
  console.warn('issueSMS', toPhone, text, options);
  let body = {
    toPhone: `'${toPhone}'`,
    fromPhone: '+12015617445',
    text,
  }
  if (options.headers && options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    const urlEncodedrequest = [];
    for (const key in body) {
      urlEncodedrequest.push(`${key}=${encodeURIComponent(body[key])}`);
    }
    const requestForm = urlEncodedrequest.reduce((pre, cur) => `${pre}&${cur}`);
    body = requestForm;
  }

  return fetch(`${options.SERVICE_HOST}`, {
    method: 'POST',
    body,
    headers: Object.assign({}, {
      'Authorization': 'Test',
    }, options.headers),
  }).then((response) => {
    return response.json();
  });
}


function shortenUrl(url, options) {
  let body = {
    url,
  }
  if (options.headers && options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    const urlEncodedrequest = [];
    for (const key in body) {
      urlEncodedrequest.push(`${key}=${body[key]}`);
    }
    const requestForm = urlEncodedrequest.reduce((pre, cur) => `${pre}&${cur}`);
    body = requestForm;
  }
  const requestOptions = {
    method: 'POST',
    headers: Object.assign({}, options.headers, {
      Authorization: 'Test',
    }),
    body,
  }

  return fetch(`${options.SERVICE_HOST}${options.SHORTEN_SERVICE}`, requestOptions).then((response) => {
    return response.json()
  });
}

const { smsContent, mailContent, mailTitle, mailSenderTitle } = config.notification;
module.exports = {
  issueEmail,
  issueSMS,
  shortenUrl,
  mailTitle,
  mailContent,
  smsContent,
  mailSenderTitle,
}