#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { SquashTMClient } from '../src/clients/index.js';

dotenv.config();

async function getAllProjects() {
  try {
    const client = new SquashTMClient();

    console.log('Fetching all projects from Squash TM...\n');
    const response = await client.getAllProjects({
      page: 0,
      size: 100  // Get more projects in one page
    });

    console.log('=== All Projects ===\n');

    // Display standard projects
    if (response._embedded?.projects && response._embedded.projects.length > 0) {
      console.log('Standard Projects:');
      response._embedded.projects.forEach((project: any, index: number) => {
        console.log(`  ${index + 1}. ${project.name} (ID: ${project.id})`);
      });
      console.log('');
    }

    // Display project templates
    if (response._embedded?.['project-templates'] && response._embedded['project-templates'].length > 0) {
      console.log('Project Templates:');
      response._embedded['project-templates'].forEach((template: any, index: number) => {
        console.log(`  ${index + 1}. ${template.name} (ID: ${template.id})`);
      });
      console.log('');
    }

    // Display pagination info
    if (response.page) {
      console.log('Pagination Info:');
      console.log(`  Page: ${response.page.number + 1}/${response.page.totalPages}`);
      console.log(`  Total Projects: ${response.page.totalElements}`);
      console.log(`  Page Size: ${response.page.size}`);
    }

    console.log('\n=== Full Response ===');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

getAllProjects();
