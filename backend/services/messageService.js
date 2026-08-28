const axios = require("axios")
// Remove spaces, brackets, etc.
// Expected result: +919876543210
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  let cleaned = phone.replace(/[^\d+]/g, "");

  // If Indian number is stored as 9876543210
  if (cleaned.length === 10) {
    cleaned = `+91${cleaned}`;
  }

  // If stored as 919876543210
  if (
    cleaned.length === 12 &&
    cleaned.startsWith("91")
  ) {
    cleaned = `+${cleaned}`;
  }

  return cleaned;
};


// Send SMS
const sendSMS = async (phone, message) => {
  try {
    console.log(phone)
  const response = await axios.post(
    "https://www.fast2sms.com/dev/bulkV2",
    {
      route: "q",
      message: message,
      numbers: phone
    },
    {
      headers: {
        Authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
  console.log("responded")
  return response.data;
  } catch (err) {
    console.log(err)
  }
}



const sendWhatsApp = async (phone, complaintId,officerName,designation) => {
  try {
    const formattedPhone = phone
      .replace(/\D/g, "");

    const url =
      `https://graph.facebook.com/` +
      `${process.env.WHATSAPP_API_VERSION}/` +
      `${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",

        to: formattedPhone,

        type: "template",

        template: {
          name: "civic_complaint_assigned",
          language: {
            code: "en_US",
          },
        },
        components: [
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text: complaintId,
                },
                {
                  type: "text",
                  text: officerName,
                },
                {
                  type: "text",
                  text: designation,
                },
              ],
            },
          ],
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",
        },
      }
    );

    console.log(
      "✅ WhatsApp sent:",
      response.data
    );

    return response.data;

  } catch (error) {
    console.error(
      "❌ WhatsApp error:",
      error.response?.data ||
      error.message
    );
  }
};


module.exports = {
  sendWhatsApp,sendSMS
};