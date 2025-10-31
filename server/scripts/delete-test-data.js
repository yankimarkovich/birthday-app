/**
 * Delete Test Data Script - Using REST API
 *
 * Removes all test birthdays via API
 * Identifies test data by notes field containing "TEST_DATA"
 *
 * Usage:
 *   node server/scripts/delete-test-data.js
 */

const readline = require('readline');

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123',
};
const TEST_MARKER = 'TEST_DATA';

// Login to get auth token
async function getAuthToken() {
  console.log('🔐 Logging in as test user...');

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });

  if (!loginRes.ok) {
    const error = await loginRes.text();
    throw new Error(
      `Failed to login. Make sure test user exists (run seed script first): ${error}`
    );
  }

  console.log('✅ Logged in successfully!\n');
  const data = await loginRes.json();
  return data.token;
}

// Fetch all birthdays
async function fetchBirthdays(token) {
  const response = await fetch(`${API_BASE}/birthdays`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch birthdays: ${error}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Delete a birthday
async function deleteBirthday(token, id) {
  const response = await fetch(`${API_BASE}/birthdays/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete birthday ${id}: ${error}`);
  }

  return response.json();
}

// Prompt for confirmation
function confirmDelete() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Type "DELETE" to confirm: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'DELETE');
    });
  });
}

// Main function
async function deleteTestData() {
  console.log('🗑️  Birthday App - Delete Test Data\n');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Get auth token
    const token = await getAuthToken();

    // Fetch all birthdays
    console.log('📊 Fetching all birthdays...\n');
    const allBirthdays = await fetchBirthdays(token);

    // Filter test data
    const testBirthdays = allBirthdays.filter((b) => b.notes === TEST_MARKER);

    if (testBirthdays.length === 0) {
      console.log('✅ No test data found. Nothing to delete.\n');
      process.exit(0);
    }

    console.log(`Found ${testBirthdays.length} test birthdays.\n`);
    console.log(`⚠️  WARNING: This will permanently delete ${testBirthdays.length} birthdays!\n`);

    const confirmed = await confirmDelete();

    if (!confirmed) {
      console.log('\n❌ Deletion cancelled.\n');
      process.exit(0);
    }

    console.log('\n🗑️  Deleting test data...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testBirthdays.length; i++) {
      try {
        await deleteBirthday(token, testBirthdays[i]._id);
        successCount++;

        if ((i + 1) % 10 === 0 || i === testBirthdays.length - 1) {
          console.log(`Progress: ${i + 1}/${testBirthdays.length} birthdays deleted`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 3) {
          // Only show first 3 errors
          console.error(`❌ Error deleting birthday #${i + 1}:`, error.message);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Deletion complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Total test birthdays: ${testBirthdays.length}`);
    console.log(`   - Successfully deleted: ${successCount}`);
    console.log(`   - Errors: ${errorCount}\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('\nMake sure your server is running on:', API_BASE);
    process.exit(1);
  }
}

// Run the script
deleteTestData();
