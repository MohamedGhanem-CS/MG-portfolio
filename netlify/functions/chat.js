// ==========================================================================
//  NETLIFY FUNCTION: /netlify/functions/chat.js
//  Secure server-side proxy for Groq AI Chat API.
//
//  HOW IT WORKS:
//  1. Browser sends { messages: [...] } to /.netlify/functions/chat
//  2. This function reads GROQ_API_KEY from Netlify env vars (secret, never visible)
//  3. Uses Node.js native 'https' module to securely forward to Groq, returning response.
//     (Eliminates dependency on global 'fetch' to support older Node runtimes!)
//
//  SETUP (one-time, takes 2 minutes):
//  → Netlify Dashboard → Your Site → Site configuration → Environment variables
//  → Add variable: Key = GROQ_API_KEY, Value = [Your Groq API Key]
// ==========================================================================

const https = require('https');

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

    const postData = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1
    });

    const options = {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // Promise wrapper for the native Node.js https request
    const performRequest = () => new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let bodyData = '';
            
            res.on('data', (chunk) => {
                bodyData += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: bodyData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });

    try {
        const result = await performRequest();
        const data = JSON.parse(result.body);

        if (result.statusCode >= 200 && result.statusCode < 300) {
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
        } else {
            console.error('Groq API error:', data);
            return {
                statusCode: result.statusCode,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: data.error?.message || 'Groq API error' })
            };
        }

    } catch (error) {
        console.error('Proxy request error:', error);
        return {
            statusCode: 502,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to reach Groq API. Try again later.' })
        };
    }
};
