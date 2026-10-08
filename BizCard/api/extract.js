const vision = require('@google-cloud/vision');
const busboy = require('busboy');

const client = new vision.ImageAnnotatorClient({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bb = busboy({ headers: req.headers });
    let imageBuffer = null;

    bb.on('file', (fieldname, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      file.on('end', () => {
        imageBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('close', async () => {
      if (!imageBuffer) {
        return res.status(400).json({ error: 'No image provided' });
      }

      try {
        const request = {
          image: { content: imageBuffer },
          features: [{ type: 'TEXT_DETECTION' }],
        };

        const [result] = await client.annotateImage(request);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
          return res.json({ text: '', fields: {} });
        }

        const fullText = detections[0].description;
        const fields = parseBusinessCardText(fullText);

        res.json({
          text: fullText,
          fields: fields
        });
      } catch (error) {
        console.error('Vision API error:', error);
        res.status(500).json({ error: 'Error processing image: ' + error.message });
      }
    });

    req.pipe(bb);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
};

function parseBusinessCardText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(line => line && line.length > 2);
  const fields = {
    name: '',
    designation: '',
    companyName: '',
    email: '',
    phone1: '',
    phone2: '',
    website: '',
    additionalInfo: ''
  };

  let phoneCount = 0;

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();

    // Email
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch && !fields.email) {
      fields.email = emailMatch[0];
    }

    // Phone numbers
    const phoneMatch = line.match(/\+?[\d\s\-\(\)]{10,}/);
    if (phoneMatch && /\d{7,}/.test(phoneMatch[0]) && phoneCount < 2) {
      if (!fields.phone1) {
        fields.phone1 = phoneMatch[0].trim();
      } else if (!fields.phone2) {
        fields.phone2 = phoneMatch[0].trim();
      }
      phoneCount++;
    }

    // Website
    const urlMatch = line.match(/(?:https?:\/\/)?(?:www\.)?[\w\.-]+\.[\w]{2,}/);
    if (urlMatch && !fields.website) {
      fields.website = urlMatch[0];
    }

    // Designation
    if ((lowerLine.includes('director') || lowerLine.includes('founder') || lowerLine.includes('ceo') ||
         lowerLine.includes('manager') || lowerLine.includes('head') || lowerLine.includes('engineer'))
        && !fields.designation && line.length < 50) {
      fields.designation = line;
    }

    // Company
    if ((lowerLine.includes('systems') || lowerLine.includes('solutions') || lowerLine.includes('services') ||
         lowerLine.includes('technologies') || lowerLine.includes('pvt') || lowerLine.includes('ltd'))
        && !fields.companyName && line.length < 80) {
      fields.companyName = line;
    }
  });

  // Find name
  if (!fields.name) {
    const potentialNames = lines.filter(line => {
      const lower = line.toLowerCase();
      return line.length < 50 &&
             !line.includes('@') &&
             !line.includes('www') &&
             !lower.includes('systems') &&
             !lower.includes('solutions') &&
             !lower.includes('specializ');
    });

    if (potentialNames.length > 0) {
      fields.name = potentialNames[0];
    }
  }

  return fields;
}
