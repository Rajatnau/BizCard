const { sql } = require('@vercel/postgres');

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS business_cards (
      id BIGINT PRIMARY KEY,
      name TEXT,
      designation TEXT,
      company_name TEXT,
      email TEXT,
      phone1 TEXT,
      phone2 TEXT,
      website TEXT,
      additional_info TEXT,
      image TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await sql`ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS designation2 TEXT;`;
  await sql`ALTER TABLE business_cards ADD COLUMN IF NOT EXISTS company_name2 TEXT;`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureTable();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM business_cards ORDER BY created_at DESC;`;
      const cards = rows.map(r => ({
        id: Number(r.id),
        name: r.name,
        designation: r.designation,
        designation2: r.designation2,
        companyName: r.company_name,
        companyName2: r.company_name2,
        email: r.email,
        phone1: r.phone1,
        phone2: r.phone2,
        website: r.website,
        additionalInfo: r.additional_info,
        image: r.image,
        timestamp: r.created_at
      }));
      return res.status(200).json({ cards });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const id = body.id || Date.now();
      await sql`
        INSERT INTO business_cards (id, name, designation, designation2, company_name, company_name2, email, phone1, phone2, website, additional_info, image)
        VALUES (${id}, ${body.name || ''}, ${body.designation || ''}, ${body.designation2 || ''}, ${body.companyName || ''}, ${body.companyName2 || ''}, ${body.email || ''}, ${body.phone1 || ''}, ${body.phone2 || ''}, ${body.website || ''}, ${body.additionalInfo || ''}, ${body.image || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          designation = EXCLUDED.designation,
          designation2 = EXCLUDED.designation2,
          company_name = EXCLUDED.company_name,
          company_name2 = EXCLUDED.company_name2,
          email = EXCLUDED.email,
          phone1 = EXCLUDED.phone1,
          phone2 = EXCLUDED.phone2,
          website = EXCLUDED.website,
          additional_info = EXCLUDED.additional_info,
          image = EXCLUDED.image;
      `;
      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }
      await sql`DELETE FROM business_cards WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DB error:', error);
    res.status(500).json({ error: error.message });
  }
};
