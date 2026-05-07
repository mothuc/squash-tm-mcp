import { SquashTMClient } from '../src/clients/SquashTMClient.js';

const client = new SquashTMClient();

async function createDatasets() {
  try {
    console.log('Creating datasets for Milwaukee TW test cases...\n');

    // TC-5110: Search - Quick search
    console.log('Creating dataset for TC-5110...');
    await client.syncDataset(5110, 'query', ['search_keyword'], ['M12']);
    console.log('✅ TC-5110 dataset "query" created');

    // TC-5111: Search - Navigate to product page
    console.log('\nCreating dataset for TC-5111...');
    await client.syncDataset(5111, 'query', ['search_keyword'], ['M12']);
    console.log('✅ TC-5111 dataset "query" created');

    // TC-5112: Search - Incomplete search
    console.log('\nCreating dataset for TC-5112...');
    await client.syncDataset(5112, 'query', ['product_name'], ['M12']);
    console.log('✅ TC-5112 dataset "query" created');

    // TC-5113: Category - Product information (5 datasets)
    console.log('\nCreating 5 datasets for TC-5113...');

    await client.syncDataset(5113, 'accessories', ['categoryUrl'], ['/product-category/accessories']);
    console.log('✅ TC-5113 dataset "accessories" created');

    await client.syncDataset(5113, 'hand-tools', ['categoryUrl'], ['/product-category/hand-tools']);
    console.log('✅ TC-5113 dataset "hand-tools" created');

    await client.syncDataset(5113, 'power-tools', ['categoryUrl'], ['/product-category/power-tools']);
    console.log('✅ TC-5113 dataset "power-tools" created');

    await client.syncDataset(5113, 'storage', ['categoryUrl'], ['/product-category/storage']);
    console.log('✅ TC-5113 dataset "storage" created');

    await client.syncDataset(5113, 'work-gear', ['categoryUrl'], ['/product-category/work-gear']);
    console.log('✅ TC-5113 dataset "work-gear" created');

    console.log('\n✅ All datasets created successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
    throw error;
  }
}

createDatasets();
