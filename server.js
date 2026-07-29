// server.js - OpenAI-compatible Proxy -> OpenRouter
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ OpenAI -> OpenRouter Proxy is running!\nEndpoints: /health, /v1/models, /v1/chat/completions');
});

// ---- OpenRouter config ----
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // set this in your environment
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';   // optional, for OpenRouter rankings
const SITE_NAME = process.env.SITE_NAME || 'My Proxy App';          // optional, for OpenRouter rankings

// Map "friendly" names your app sends -> real OpenRouter model slugs.
// Every value below ends in ":free" - $0 per token, but rate-limited
// (roughly 20 requests/minute, 50/day per OpenRouter account until you've
// bought $10+ in credits, which raises the daily cap to 1,000).
// This list was verified live against https://openrouter.ai/collections/free-models
// on 2026-07-29 - free models rotate over time, so re-check that page if one
// of these ever starts returning a 404/model-not-found error.
const MODEL_MAPPING = {
  'gpt-3.5-turbo': 'nvidia/nemotron-nano-9b-v2:free',          // small & fast
  'gpt-4': 'google/gemma-4-31b-it:free',                       // solid general-purpose
  'gpt-4-turbo': 'tencent/hy3:free',                           // larger, 262K context
  'gpt-4o': 'nvidia/nemotron-3-super-120b-a12b:free',          // large MoE, 1M context
  'claude-3-opus': 'nvidia/nemotron-3-ultra-550b-a55b:free',   // largest free model available, 1M context
  'claude-3-sonnet': 'google/gemma-4-26b-a4b-it:free',         // efficient MoE
  'gemini-pro': 'google/gemma-4-31b-it:free',                  // kept in the Google family
  'deepseek-r1': 'openai/gpt-oss-20b:free'                     // no free DeepSeek R1 was live at check time; this is a free reasoning-capable stand-in
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'OpenAI -> OpenRouter Proxy' });
});

app.get('/v1/models', (req, res) => {
  const models = Object.keys(MODEL_MAPPING).map(model => ({
    id: model,
    object: 'model',
    created: Date.now(),
    owned_by: 'openrouter-proxy'
  }));
  res.json({ object: 'list', data: models });
});

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream } = req.body;

    // Use the mapped model if we know it, otherwise pass the requested name straight through
    // (OpenRouter model names already look like "provider/model", so this often just works)
    const orModel = MODEL_MAPPING[model] || model;

    const orRequest = {
      model: orModel,
      messages: messages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 1024,
      stream: stream || false
    };

    const response = await axios.post(`${OPENROUTER_API_BASE}/chat/completions`, orRequest, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,   // optional, OpenRouter uses this for their leaderboard
        'X-Title': SITE_NAME        // optional, same purpose
      },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res); // OpenRouter's stream is already OpenAI-shaped, so just forward it
      response.data.on('end', () => res.end());
      response.data.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      // OpenRouter's non-streaming response already matches OpenAI's shape closely,
      // so we can mostly pass it straight through.
      res.json(response.data);
    }

  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'invalid_request_error',
        code: error.response?.status || 500
      }
    });
  }
});

app.all('*', (req, res) => {
  res.status(404).json({
    error: { message: `Endpoint ${req.path} not found`, type: 'invalid_request_error', code: 404 }
  });
});

app.listen(PORT, () => {
  console.log(`OpenAI -> OpenRouter Proxy running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});  'gpt-4': 'nvidia/llama-3.1-nemotron-super-49b-v1',

  // 🟡 Same tier (keep consistent for RP stability)
  'gpt-4-turbo': 'nvidia/llama-3.1-nemotron-super-49b-v1',

  // 🔴 Cinematic / emotional RP
  'gpt-4o': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',

  // 🔴 High-quality storytelling / long scenes
  'claude-3-opus': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',

  // 🟡 Clean dialogue RP
  'claude-3-sonnet': 'nvidia/llama-3.1-nemotron-super-49b-v1',

  // 🔥 Experimental / lore-heavy RP
  'gemini-pro': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',

  // 🧠 Deep reasoning RP (IMPORTANT ADDITION)
  // This is NOT a Nemotron model — it's DeepSeek R1 served via NVIDIA NIM-style endpoint
  'deepseek-r1': 'deepseek-ai/deepseek-r1'
};
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'OpenAI to NVIDIA NIM Proxy', 
    reasoning_display: SHOW_REASONING,
    thinking_mode: ENABLE_THINKING_MODE
  });
});

// List models endpoint (OpenAI compatible)
app.get('/v1/models', (req, res) => {
  const models = Object.keys(MODEL_MAPPING).map(model => ({
    id: model,
    object: 'model',
    created: Date.now(),
    owned_by: 'nvidia-nim-proxy'
  }));
  
  res.json({
    object: 'list',
    data: models
  });
});

// Chat completions endpoint (main proxy)
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream } = req.body;
    
    // Smart model selection with fallback
    let nimModel = MODEL_MAPPING[model];
    if (!nimModel) {
      try {
        await axios.post(`${NIM_API_BASE}/chat/completions`, {
          model: model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        }, {
          headers: { 'Authorization': `Bearer ${NIM_API_KEY}`, 'Content-Type': 'application/json' },
          validateStatus: (status) => status < 500
        }).then(res => {
          if (res.status >= 200 && res.status < 300) {
            nimModel = model;
          }
        });
      } catch (e) {}
      
      if (!nimModel) {
        const modelLower = model.toLowerCase();
        if (modelLower.includes('gpt-4') || modelLower.includes('claude-opus') || modelLower.includes('405b')) {
          nimModel = 'meta/llama-3.1-405b-instruct';
        } else if (modelLower.includes('claude') || modelLower.includes('gemini') || modelLower.includes('70b')) {
          nimModel = 'meta/llama-3.1-70b-instruct';
        } else {
          nimModel = 'meta/llama-3.1-8b-instruct';
        }
      }
    }
    
    // Transform OpenAI request to NIM format
    const nimRequest = {
      model: nimModel,
      messages: messages,
      temperature: temperature || 0.6,
      max_tokens: max_tokens || 9024,
      extra_body: ENABLE_THINKING_MODE ? { chat_template_kwargs: { thinking: true } } : undefined,
      stream: stream || false
    };
    
    // Make request to NVIDIA NIM API
    const response = await axios.post(`${NIM_API_BASE}/chat/completions`, nimRequest, {
      headers: {
        'Authorization': `Bearer ${NIM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json'
    });
    
    if (stream) {
      // Handle streaming response with reasoning
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      let buffer = '';
      let reasoningStarted = false;
      
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';
        
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            if (line.includes('[DONE]')) {
              res.write(line + '\\n');
              return;
            }
            
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices?.[0]?.delta) {
                const reasoning = data.choices[0].delta.reasoning_content;
                const content = data.choices[0].delta.content;
                
                if (SHOW_REASONING) {
                  let combinedContent = '';
                  
                  if (reasoning && !reasoningStarted) {
                    combinedContent = '<think>\\n' + reasoning;
                    reasoningStarted = true;
                  } else if (reasoning) {
                    combinedContent = reasoning;
                  }
                  
                  if (content && reasoningStarted) {
                    combinedContent += '</think>\\n\\n' + content;
                    reasoningStarted = false;
                  } else if (content) {
                    combinedContent += content;
                  }
                  
                  if (combinedContent) {
                    data.choices[0].delta.content = combinedContent;
                    delete data.choices[0].delta.reasoning_content;
                  }
                } else {
                  if (content) {
                    data.choices[0].delta.content = content;
                  } else {
                    data.choices[0].delta.content = '';
                  }
                  delete data.choices[0].delta.reasoning_content;
                }
              }
              res.write(`data: ${JSON.stringify(data)}\\n\\n`);
            } catch (e) {
              res.write(line + '\\n');
            }
          }
        });
      });
      
      response.data.on('end', () => res.end());
      response.data.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      // Transform NIM response to OpenAI format with reasoning
      const openaiResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: response.data.choices.map(choice => {
          let fullContent = choice.message?.content || '';
          
          if (SHOW_REASONING && choice.message?.reasoning_content) {
            fullContent = '<think>\\n' + choice.message.reasoning_content + '\\n</think>\\n\\n' + fullContent;
          }
          
          return {
            index: choice.index,
            message: {
              role: choice.message.role,
              content: fullContent
            },
            finish_reason: choice.finish_reason
          };
        }),
        usage: response.data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      res.json(openaiResponse);
    }
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    res.status(error.response?.status || 500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'invalid_request_error',
        code: error.response?.status || 500
      }
    });
  }
});

// Catch-all for unsupported endpoints
app.all('*', (req, res) => {
  res.status(404).json({
    error: {
      message: `Endpoint ${req.path} not found`,
      type: 'invalid_request_error',
      code: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`OpenAI to NVIDIA NIM Proxy running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Reasoning display: ${SHOW_REASONING ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Thinking mode: ${ENABLE_THINKING_MODE ? 'ENABLED' : 'DISABLED'}`);
});
