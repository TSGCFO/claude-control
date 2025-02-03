import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AnthropicProvider } from '../src/core/llm/anthropic';
import { UserRequest } from '../src/types';

const app = express();
const port = process.env.PORT || 3001;

// Initialize Anthropic provider
const anthropic = new AnthropicProvider();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const request: UserRequest = req.body;
    const response = await anthropic.processRequest(request);
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});