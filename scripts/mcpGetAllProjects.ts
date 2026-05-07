#!/usr/bin/env node
/**
 * Test script to demonstrate using get_all_projects via MCP client
 * This simulates what Claude Desktop would do when calling the MCP tool
 */
import * as dotenv from 'dotenv';
import { SquashTMClient } from '../src/clients/index.js';

dotenv.config();

async function mcpGetAllProjects() {
  try {
    console.log('=== Calling get_all_projects MCP Tool ===\n');

    // This is what the MCP server does when get_all_projects is called
    const client = new SquashTMClient();

    // Call with larger page size to get all projects
    const result = await client.getAllProjects({
      page: 0,
      size: 100
    });

    console.log('=== Projects Retrieved ===\n');

    // Display standard projects
    if (result._embedded?.projects && result._embedded.projects.length > 0) {
      console.log(`📁 Standard Projects (${result._embedded.projects.length}):\n`);
      result._embedded.projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name}`);
        console.log(`     ID: ${project.id}`);
        if (project.label) console.log(`     Label: ${project.label}`);
        if (project.description) console.log(`     Description: ${project.description}`);
        console.log('');
      });
    }

    // Display project templates
    if (result._embedded?.['project-templates'] && result._embedded['project-templates'].length > 0) {
      console.log(`📋 Project Templates (${result._embedded['project-templates'].length}):\n`);
      result._embedded['project-templates'].forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name}`);
        console.log(`     ID: ${template.id}`);
        if (template.label) console.log(`     Label: ${template.label}`);
        console.log('');
      });
    }

    // Summary
    console.log('=== Summary ===');
    if (result.page) {
      console.log(`Total Projects: ${result.page.totalElements}`);
      console.log(`Page: ${result.page.number + 1}/${result.page.totalPages}`);
      console.log(`Page Size: ${result.page.size}`);
    }

    // Return MCP-formatted response
    const mcpResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };

    console.log('\n=== MCP Tool Response ===');
    console.log('(This is what Claude Desktop receives)\n');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

mcpGetAllProjects();
