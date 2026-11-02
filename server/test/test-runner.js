/**
 * NexusForge Backend Automated API & Model Test Suite
 * Fully automated tests covering every endpoint, validation, and error scenario.
 */

const http = require('http');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

const API_PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${API_PORT}`;

let passedCount = 0;
let failedCount = 0;
const results = [];

function log(title, passed, details = '') {
  if (passed) {
    passedCount++;
    console.log(`  \x1b[32m✓\x1b[0m ${title}`);
    results.push({ title, status: 'PASS' });
  } else {
    failedCount++;
    console.log(`  \x1b[31m✗\x1b[0m ${title} ${details ? `(${details})` : ''}`);
    results.push({ title, status: 'FAIL', details });
  }
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  NexusForge Backend - Full Automated Test Suite');
  console.log('======================================================\n');

  // Ensure server is reachable, start if needed (e.g. in CI)
  let serverProcess = null;
  try {
    await makeRequest('GET', '/api/health');
  } catch {
    console.log('Test server not running. Spawning local server instance for tests...');
    const { spawn } = require('child_process');
    serverProcess = spawn(process.execPath, ['server.js'], {
      cwd: require('path').resolve(__dirname, '..'),
      env: { ...process.env, PORT: API_PORT, ADMIN_PIN: '1234' }
    });
    // Wait up to 3 seconds for server to boot
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        await makeRequest('GET', '/api/health');
        break;
      } catch {}
    }
  }

  // ----------------------------------------------------
  // SECTION 1: HEALTH & CORS TESTING
  // ----------------------------------------------------
  console.log('\x1b[36m[1/4] Server Health & Gateway Diagnostics\x1b[0m');
  try {
    const health = await makeRequest('GET', '/api/health');
    log('GET /api/health returns HTTP 200', health.statusCode === 200);
    log('Health payload reports server: "NexusForge API"', health.body.server === 'NexusForge API');
    log('Health payload contains mongoConnected boolean flag', typeof health.body.mongoConnected === 'boolean');

    const corsCheck = await makeRequest('OPTIONS', '/api/projects', null, {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST'
    });
    log('CORS headers allow incoming frontend origins', Boolean(corsCheck.headers['access-control-allow-origin']));
  } catch (err) {
    log('Server health diagnostics reachable', false, err.message);
  }

  // ----------------------------------------------------
  // SECTION 2: ADMIN SECURITY & AUTH VERIFICATION
  // ----------------------------------------------------
  console.log('\n\x1b[36m[2/4] Admin PIN Authentication & Security Gates\x1b[0m');
  try {
    // Correct PIN
    const verifyValid = await makeRequest('POST', '/api/admin/verify', { pin: '1234' });
    log('POST /api/admin/verify with valid PIN (1234) returns { success: true }', verifyValid.body.success === true);

    // Whitespace trimmed PIN
    const verifyTrimmed = await makeRequest('POST', '/api/admin/verify', { pin: ' 1234 ' });
    log('POST /api/admin/verify trims leading/trailing whitespace', verifyTrimmed.body.success === true);

    // Invalid PIN
    const verifyInvalid = await makeRequest('POST', '/api/admin/verify', { pin: '9999' });
    log('POST /api/admin/verify with invalid PIN returns { success: false }', verifyInvalid.body.success === false);

    // Missing PIN
    const verifyEmpty = await makeRequest('POST', '/api/admin/verify', {});
    log('POST /api/admin/verify with missing PIN body returns { success: false }', verifyEmpty.body.success === false);

    // Auth verify route
    const authValid = await makeRequest('POST', '/api/auth/verify-pin', { pin: '1234' });
    log('POST /api/auth/verify-pin returns HTTP 200 on match', authValid.statusCode === 200 && authValid.body.success === true);

    const authInvalid = await makeRequest('POST', '/api/auth/verify-pin', { pin: '0000' });
    log('POST /api/auth/verify-pin returns HTTP 401 on invalid PIN', authInvalid.statusCode === 401 && authInvalid.body.success === false);
  } catch (err) {
    log('Admin authentication endpoints responded', false, err.message);
  }

  // ----------------------------------------------------
  // SECTION 3: MONGODB CONNECTION MIDDLEWARE & ENDPOINT SAFEGUARDS
  // ----------------------------------------------------
  console.log('\n\x1b[36m[3/4] Resilience & Offline Graceful Fallback Endpoints\x1b[0m');
  try {
    const projRes = await makeRequest('GET', '/api/projects');
    if (mongoose.connection.readyState === 1) {
      log('GET /api/projects returns HTTP 200 when MongoDB is connected', projRes.statusCode === 200);
      log('GET /api/projects returns an array of projects', Array.isArray(projRes.body));
    } else {
      log('GET /api/projects returns HTTP 503 when MongoDB is offline', projRes.statusCode === 503);
      log('GET /api/projects payload specifies offline: true', projRes.body.offline === true);
    }

    const taskRes = await makeRequest('GET', '/api/tasks');
    if (mongoose.connection.readyState === 1) {
      log('GET /api/tasks returns HTTP 200 when MongoDB is connected', taskRes.statusCode === 200);
    } else {
      log('GET /api/tasks returns HTTP 503 when MongoDB is offline', taskRes.statusCode === 503);
      log('GET /api/tasks payload specifies offline: true', taskRes.body.offline === true);
    }
  } catch (err) {
    log('Endpoint resilience responded without unhandled crash', false, err.message);
  }

  // ----------------------------------------------------
  // SECTION 4: MONGOOSE MODELS VALIDATION & SCHEMAS
  // ----------------------------------------------------
  console.log('\n\x1b[36m[4/4] Mongoose Schema Validations & Data Integrity\x1b[0m');
  try {
    // Project model validation
    const validProject = new Project({
      id: 'test-p-1',
      name: 'Automated Test Project',
      summary: 'Testing summary',
      techStack: ['Node.js', 'React']
    });
    const pValidation = validProject.validateSync();
    log('Project schema accepts valid attributes without errors', pValidation === undefined);

    const invalidProject = new Project({});
    const pInvalidError = invalidProject.validateSync();
    log('Project schema enforces required "id" and "name" fields', Boolean(pInvalidError && pInvalidError.errors.name && pInvalidError.errors.id));

    // Task model validation
    const validTask = new Task({
      id: 'test-t-1',
      projectId: 'test-p-1',
      title: 'Automated Test Task',
      status: 'Done'
    });
    const tValidation = validTask.validateSync();
    log('Task schema accepts valid task data', tValidation === undefined);

    const invalidTask = new Task({
      id: 'test-t-2',
      projectId: 'test-p-1',
      title: 'Invalid Enum Task',
      status: 'UnknownStatus'
    });
    const tEnumError = invalidTask.validateSync();
    log('Task schema rejects invalid status enum values', Boolean(tEnumError && tEnumError.errors.status));
  } catch (err) {
    log('Mongoose schema validation checks completed', false, err.message);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`  Tests Passed: \x1b[32m${passedCount}\x1b[0m | Failed: \x1b[31m${failedCount}\x1b[0m | Total: ${passedCount + failedCount}`);
  console.log('======================================================\n');

  if (serverProcess) {
    serverProcess.kill();
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
