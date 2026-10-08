const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const vision = require('@google-cloud/vision');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

app.post('/api/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;

    const request = {
      image: { content: imageBuffer },
      features: [{ type: 'TEXT_DETECTION' }],
    };

    const [result] = await client.annotateImage(request);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return res.json({ text: '', fields: {} });
    }

    // Full text
    const fullText = detections[0].description;

    // Parse extracted text for structured fields
    const fields = parseBusinessCardText(fullText);

    res.json({
      text: fullText,
      fields: fields
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

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

  let emailCount = 0;
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
    if (phoneMatch && /\d{7,}/.test(phoneMatch[0])) {
      if (!fields.phone1) {
        fields.phone1 = phoneMatch[0].trim();
      } else if (!fields.phone2) {
        fields.phone2 = phoneMatch[0].trim();
      }
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

    // Company keywords
    if ((lowerLine.includes('systems') || lowerLine.includes('solutions') || lowerLine.includes('services') ||
         lowerLine.includes('technologies') || lowerLine.includes('pvt') || lowerLine.includes('ltd'))
        && !fields.companyName && line.length < 80) {
      fields.companyName = line;
    }
  });

  // Find name (first meaningful line)
  if (!fields.name) {
    const potentialNames = lines.filter(line => {
      const lower = line.toLowerCase();
      return line.length < 50 &&
             !line.includes('@') &&
             !line.includes('www') &&
             !lower.includes('systems') &&
             !lower.includes('solutions') &&
             !lower.includes('specializ') &&
             !lower.includes('enabling');
    });

    if (potentialNames.length > 0) {
      fields.name = potentialNames[0];
    }
  }

  return fields;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
