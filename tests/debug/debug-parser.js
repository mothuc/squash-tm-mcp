#!/usr/bin/env node

import { ParserClient } from './dist/clients/ParserClient.js';
import * as fs from 'fs';

const featureFilePath = '/home/thuc/Projects/mwkjp-squash-tests/features/Admin_features/Order_for_bundle/2704_Create_Delivery_order.feature';
const featureContent = fs.readFileSync(featureFilePath, 'utf-8');

const parser = new ParserClient();
const datasets = parser.parseDatasets(featureContent);

console.log('Parsed datasets:');
console.log(JSON.stringify(datasets, null, 2));
