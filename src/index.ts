import RingCentral from '@rc-ex/core';
import PubNubExtension from '@rc-ex/pubnub';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});
const pubNubExtension = new PubNubExtension();

(async () => {
  await rc.installExtension(pubNubExtension);
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });
  const r = await rc.restapi().account().extension().phoneNumber().get();
  const smsPhoneNumbers = r.records?.filter(
    p => p.features?.indexOf('SmsSender') !== -1
  );
  if (smsPhoneNumbers?.length === 0) {
    console.error('This is no number available to send SMS');
    return;
  }
  console.log(JSON.stringify(r, null, 2));
  const r2 = await rc
    .restapi()
    .account()
    .extension()
    .sms()
    .post({
      from: {
        phoneNumber: smsPhoneNumbers![0].phoneNumber,
      },
      to: [
        {
          phoneNumber: process.env.RINGCENTRAL_RECEIVER,
        },
      ],
      text: 'Hello world!',
    });
  console.log(JSON.stringify(r2, null, 2));
})();
