const Blynk = require("blynk-library");
const miio = require("miio");
const axios = require("axios");

// Blynk nodemcu token
const token = "3c0eebb72fb1495faa062c520f74ed48";
// Blynk server (raspberry) IP and Port
const serverIP = "109.49.76.78";
const serverPort = 8080;

// Xiaomi bulb IP
const bulbIP = "192.168.1.8";
const bulbToken = "5d51c5e2bb0beb6360eb4cb19d5f5363";

// Blynk config
const blynk = new Blynk.Blynk(
  token,
  (options = {
    connector: new Blynk.TcpClient(
      (options = { addr: serverIP, port: serverPort })
    )
  })
);

// Handle any erros within the blynk library
blynk.on("error", err => {
  switch (err) {
    case "ECONNREFUSED":
      console.log("Connection to the blynk server was lost");
      break;

    default:
      console.log("There was an error with Blynk");
      break;
  }
});

const power = new blynk.VirtualPin(10);
const brightness = new blynk.VirtualPin(11);
const temperature = new blynk.VirtualPin(12);
const desk = new blynk.VirtualPin(3);
const bed = new blynk.VirtualPin(4);

desk.on("write", function(param) {
  sendStatus("desk", param == 0 ? "true" : "false");
});

bed.on("write", function(param) {
  sendStatus("bed", param == 0 ? "true" : "false");
});

power.on("write", function(param) {
  miio
    .device({ address: bulbIP, token: bulbToken })
    .then(device => {
      device
        .setPower(param == 1 ? true : false)
        .then(on => {
          device.destroy();
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  sendStatus("ceiling", param == 1 ? "true" : "false");
});

brightness.on("write", param => {
  miio
    .device({ address: bulbIP, token: bulbToken })
    .then(device => {
      device
        .setBrightness(parseInt(param, 10))
        .then(brightness => {
          device.destroy();
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  sendStatus("light", parseInt(param, 10));
});

temperature.on("write", param => {
  const temp = `${param}k`;
  miio
    .device({ address: bulbIP, token: bulbToken })
    .then(device => {
      device.setColor(temp).then(color => {
        device.destroy();
      });
    })
    .catch(err => console.log(err));
  sendStatus("color", temp);
});

const sendStatus = (device, status) => {
	axios.get('https://autoremotejoaomgcd.appspot.com/sendmessage', {
	params: {
	  key: "APA91bHivvCrmUTWnALJRFHT39qv4Gz1gyWIudEV3bYQNRBLCuya3BP1VsrpXLU11K1ttYXRnucs4IkwSW1Eo9v0k2DB-Pn_HtmgjxdnQUnQEXR0oG-za4Bw8HDcSIdpuyqjJvBnW67U",
	  message: `${device}:${status}`
	}
	  })
	  .then(function (response) {
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
}

















