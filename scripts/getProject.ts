#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { SquashTMClient } from '../src/clients/index.js';

dotenv.config();

async function getProject(projectName: string) {
  try {
    const client = new SquashTMClient();

    console.log(`Fetching project: "${projectName}"...`);
    const project = await client.getProjectByName(projectName);

    console.log('\n=== Project Details ===');
    console.log(JSON.stringify(project, null, 2));

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: npm run get-project <project-name>');
  console.error('Example: npm run get-project "milwaukee jp"');
  process.exit(1);
}

getProject(projectName);
