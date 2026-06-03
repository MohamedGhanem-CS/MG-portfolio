// ==========================================================================
//  NETLIFY FUNCTION: /netlify/functions/chat.js
//  Secure server-side proxy for Groq AI Chat API.
//
//  HOW IT WORKS:
//  1. Browser sends { messages: [...] } to /.netlify/functions/chat
//  2. This function prepends the private, server-side systemPrompt to secure the assistant's persona.
//  3. It strips any system prompts sent by the client to prevent prompt injections.
//  4. Reads GROQ_API_KEY from Netlify env vars (secret, never visible in client).
//  5. Uses Node.js native 'https' module to securely forward to Groq, returning response.
// ==========================================================================

const https = require('https');

// Secure Server-Side System Prompt defining the AI Assistant persona
const SYSTEM_PROMPT = `You are MG AI Assistant (Mohamed Ghanem's AI Assistant). You speak on behalf of Mohamed Ghanem to portfolio visitors. Keep your responses concise (under 3 sentences), highly engaging, friendly, and professional. 
Here are the facts about Mohamed:
- Name: Mohamed Ghanem
- Title: AI Engineer & Computer Science Student at El Shorouk Academy.
- Bio: Passionate CS student dedicated to Machine Learning, Large Language Models (LLMs), and prompt engineering. He doesn't just use AI; he aims to understand their core mechanisms and develop smart, practical applications.
- Skills: Python, Machine Learning, Deep Learning, LLM APIs, Prompt Engineering, C#, C, HTML, CSS, JavaScript, SQL.
- Projects:
  1. PromptCraft Studio: An interactive prompt playground and library.
  2. NeuralForge Simulator: A web-based visualizer for Neural Networks.
  3. LocalAgent Assistant: A local LLM agent manager powered by Ollama.
  4. PyStream Analytics: Real-time high-throughput Python streaming engine.
- Experience:
  1. Lead Academic Developer at El Shorouk Academy (designing project registration system, tutoring peers).
  2. Open-source contributor.
- Social Links:
  - LinkedIn: https://linkedin.com/in/mohamed-ghanem-cs
  - GitHub: https://github.com/MohamedGhanem-CS
  - Email: mohamed.ghanem.work@gmail.com
- Website Function/Purpose: This website is Mohamed Ghanem's premium single-page developer portfolio. It exists to showcase his skills as an AI Engineer, highlight his custom machine learning projects, share his academic leadership at El Shorouk Academy, and let recruiters, professors, or collaborators connect and build AI systems with him.
Only talk about Mohamed and this portfolio. If asked about unrelated things, politely steer the conversation back to Mohamed's portfolio, background, or how to contact him. Never invent details.`;

exports.handler = async (event) => {
    // Determine incoming Origin and build CORS headers FIRST (needed by all return paths)
    const origin = event.headers.origin || event.headers.Origin || '';
    const allowedOrigins = [
        'https://mohamedganem-dev.netlify.app',
        'https://mohamedganem-dev.netlify.app/',
        'https://mohamedghanem-dev.netlify.app',
        'http://localhost',
        'http://127.0.0.1'
    ];
    const corsHeaders = {
        'Content-Type': 'application/json'
    };
    const isAllowedOrigin = allowedOrigins.some(allowed => origin.toLowerCase().startsWith(allowed.toLowerCase()));
    if (isAllowedOrigin) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
        corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
        corsHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    }

    // Handle preflight OPTIONS requests FIRST — must precede the POST-only check
    // so browsers receive 200 + CORS headers instead of a rejected 405
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Only allow POST requests (OPTIONS already handled above)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Read the secret key from server environment — NEVER from client
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY environment variable is not set.');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Server configuration error. API key not set.' })
        };
    }

    // Parse incoming request body
    let clientMessages;
    try {
        const body = JSON.parse(event.body);
        clientMessages = body.messages;
        if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
            throw new Error('Invalid messages array');
        }
    } catch {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid request body. Expected { messages: [...] }' })
        };
    }

    // Hardening: Filter out client-sent system prompts to prevent prompt injection overrides
    const sanitizedMessages = clientMessages.filter(msg => msg.role !== 'system');

    // Securely prepend the private server-side system prompt at position 0
    const finalMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitizedMessages
    ];

    const postData = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: finalMessages,
        temperature: 0.7, // Slightly reduced temperature for more factual responses
        max_completion_tokens: 500, // Safe bounds for portfolio assistant
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
                headers: corsHeaders,
                body: JSON.stringify({
                    reply: data.choices?.[0]?.message?.content || null
                })
            };
        } else {
            console.error('Groq API error:', data);
            return {
                statusCode: result.statusCode,
                headers: corsHeaders,
                body: JSON.stringify({ error: data.error?.message || 'Groq API error' })
            };
        }

    } catch (error) {
        console.error('Proxy request error:', error);
        return {
            statusCode: 502,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to reach Groq API. Try again later.' })
        };
    }
};
