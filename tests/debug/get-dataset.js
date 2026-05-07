#!/usr/bin/env node

import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function getDataset() {
  const datasetId = parseInt(process.argv[2]);

  if (!datasetId) {
    console.error('Usage: node get-dataset.js <datasetId>');
    process.exit(1);
  }

  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const token = process.env.SQUASH_TM_API_TOKEN;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(`${baseURL}/datasets/${datasetId}`, { headers });
    const data = await response.json();

    console.log('Dataset:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getDataset();
