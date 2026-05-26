// ==========================================================================
//  NETLIFY FUNCTION: /netlify/functions/chat.js
//  Secure server-side proxy for Groq AI Chat API.
//
//  HOW IT WORKS:
//  1. Browser sends { messages: [...] } to /.netlify/functions/chat
//  2. This function reads GROQ_API_KEY from Netlify env vars (secret, never visible)
//  3. Forwards the request to Groq and returns the reply to the browser
//
//  SETUP (one-time, takes 2 minutes):
//  → Netlify Dashboard → Your Site → Site configuration → Environment variables
//  → Add variable: Key = GROQ_API_KEY, Value = [Your Groq API Key]
// ==========================================================================

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Read the secret key from server environment — NEVER from client
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY environment variable is not set.');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Server configuration error. API key not set.' })
        };
    }

    // Parse incoming request body
    let messages;
    try {
        const body = JSON.parse(event.body);
        messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Invalid messages array');
        }
    } catch {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid request body. Expected { messages: [...] }' })
        };
    }

    try {
        // Forward to Groq API using the secret server-side key
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 1,
                max_completion_tokens: 1024,
                top_p: 1
            })
        });

        const data = await groqResponse.json();

        if (!groqResponse.ok) {
            console.error('Groq API error:', data);
            return {
                statusCode: groqResponse.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: data.error?.message || 'Groq API error' })
            };
        }

        // Return only what the browser needs — NOT the raw API response with secrets
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  // Allow portfolio domain
            },
            body: JSON.stringify({
                reply: data.choices?.[0]?.message?.content || null
            })
        };

    } catch (error) {
        console.error('Proxy fetch error:', error);
        return {
            statusCode: 502,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to reach Groq API. Try again later.' })
        };
    }
};
