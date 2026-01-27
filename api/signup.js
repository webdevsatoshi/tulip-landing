import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { email, phone } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    try {
        // Connect to Neon using environment variable
        const sql = neon(process.env.DATABASE_URL);

        // Create table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS beta_signups (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Insert the signup
        await sql`
            INSERT INTO beta_signups (email, phone)
            VALUES (${email}, ${phone})
            ON CONFLICT (email) DO UPDATE SET
                phone = COALESCE(EXCLUDED.phone, beta_signups.phone),
                created_at = CURRENT_TIMESTAMP
        `;

        return res.status(200).json({ success: true, message: 'Successfully signed up!' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to save signup' });
    }
}
