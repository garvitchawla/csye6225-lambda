console.log('Loading event');
var aws = require('aws-sdk');
var ddb = new aws.DynamoDB({params: {TableName: 'snstable'}});

exports.handler = function(event, context) {
  console.log(event);
  //var SnsMessageId = event.Records[0].Sns.MessageId;
  var SnsMessage = event.Records[0].Sns.Message;
  console.log(SnsMessage);
  var Snsuseremail = SnsMessage.split(':')[0];
  var ResetToken = SnsMessage.split(':')[1];
  var itemParams = {Item: {email: {S: Snsuseremail},
  token: {S: ResetToken}, }};
  // ddb.putItem(itemParams, function() {
  //   context.done(null,'');
  // });
  
  var getparams = {
  TableName: 'snstable',
  Key: {
    'email' : {S: Snsuseremail},
  }
};


  ddb.getItem(getparams, function(err, data) {
    console.log(err, data);
    console.log(data);
  if (data) {
    console.log(data.Key);
    console.log("Already Present", data);
  } else {
    ddb.putItem(itemParams, function() {
      console.log(itemParams);
    context.done(null, '');
});
  }
});
  
  
  
  
  
  
  
  
  
  
  
  console.log('Handling confirmation email to', Snsuseremail);
  if (!Snsuseremail.match(/^[^@]+@[^@]+$/)) {
        console.log('Not sending: invalid email address', Snsuseremail);
        context.done(null, "Failed");
        return;
      }
  const textBody = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + '/reset/' + ResetToken + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n';
        
  const params = {
        Destination: {
          ToAddresses: [Snsuseremail]
        },
        Message: {
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: textBody
            }
          },
          Subject: {
            Charset: "UTF-8",
            Data: "Password Reset Link"
          }
        },
        Source: " Hi from <palak@csye6225-fall2018-sharmapa.me>"
      };
  // Create the promise and SES service object
      const sendPromise = new aws.SES({ apiVersion: "2010-12-01" })
        .sendEmail(params)
        .promise();

      // Handle promise's fulfilled/rejected states
      sendPromise
        .then(data => {
          console.log(data.MessageId);
          context.done(null, "Success");
        })
        .catch(err => {
          console.error(err, err.stack);
          context.done(null, "Failed");
        });
  
};
  

