/**
 * Seed Test Data Script - Using REST API
 *
 * Adds 110 test birthdays via API:
 * - 50 birthdays spread randomly across the year
 * - 10 birthdays for TODAY (to test the Today tab)
 * - 5 special dates with 10 birthdays each
 *
 * Automatically creates test user if it doesn't exist
 *
 * Usage:
 *   node server/scripts/seed-test-data.js
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpass123',
};

const TEST_MARKER = 'TEST_DATA';

// Generate random names
const firstNames = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Avery',
  'Quinn',
  'Sam',
  'Jamie',
  'Dakota',
  'Skyler',
  'Peyton',
  'Rowan',
  'Sage',
  'River',
  'Charlie',
  'Dylan',
  'Hayden',
  'Parker',
  'Reese',
  'Blake',
  'Cameron',
  'Drew',
  'Elliot',
  'Finley',
  'Harper',
  'Indigo',
  'Jesse',
  'Kai',
  'Logan',
  'Micah',
  'Noah',
  'Oakley',
  'Phoenix',
  'Quincy',
  'Rory',
  'Sawyer',
  'Tatum',
  'Uma',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
];

const emails = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];

// Sleep function to add delay between requests (avoid rate limiting)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function randomEmail(name) {
  const domain = emails[Math.floor(Math.random() * emails.length)];
  const username = name.toLowerCase().replace(' ', '.');
  return `${username}@${domain}`;
}

function randomDate() {
  const year = Math.floor(Math.random() * 46) + 1980;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

function specificDate(month, day) {
  return new Date(Math.floor(Math.random() * 46) + 1980, month, day);
}

function formatDate(date) {
  // Format date without timezone conversion (preserve local date)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Create or login test user
async function getAuthToken() {
  console.log('🔐 Checking for test user...');

  // Try to login first
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  });

  if (loginRes.ok) {
    console.log('✅ Test user exists, logged in successfully!\n');
    const data = await loginRes.json();
    return data.token;
  }

  // User doesn't exist, create it
  console.log('📝 Test user not found, creating new user...');
  const registerRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  });

  if (!registerRes.ok) {
    const error = await registerRes.text();
    throw new Error(`Failed to create test user: ${error}`);
  }

  console.log('✅ Test user created successfully!\n');
  const data = await registerRes.json();
  return data.token;
}

// Create a birthday via API
async function createBirthday(token, birthdayData) {
  const response = await fetch(`${API_BASE}/birthdays`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(birthdayData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create birthday: ${error}`);
  }

  return response.json();
}

// Main function
async function seedTestData() {
  console.log('🎂 Birthday App - Test Data Seeder\n');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Get auth token (creates user if needed)
    const token = await getAuthToken();

    console.log('📊 Generating test data...\n');

    const birthdays = [];

    // 1. Generate 50 random birthdays
    console.log('Creating 50 random birthdays...');
    for (let i = 0; i < 50; i++) {
      const name = randomName();
      birthdays.push({
        name,
        date: formatDate(randomDate()),
        email: randomEmail(name),
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        notes: TEST_MARKER,
      });
    }

    // 2. Generate 10 birthdays for TODAY
    console.log('Creating 10 birthdays for today...');
    const today = new Date();
    const todayFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
    }).format(today);

    for (let i = 0; i < 10; i++) {
      const name = randomName();
      birthdays.push({
        name,
        date: formatDate(specificDate(today.getMonth(), today.getDate())),
        email: randomEmail(name),
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        notes: `${TEST_MARKER} - TODAY`,
      });
    }

    // 3. Generate 5 dates with 10 birthdays each
    console.log('Creating 5 special dates with 10 birthdays each...');
    const specialDates = [
      { month: 0, day: 15, name: 'January 15' },
      { month: 3, day: 22, name: 'April 22' },
      { month: 6, day: 4, name: 'July 4' },
      { month: 9, day: 31, name: 'October 31' },
      { month: 11, day: 25, name: 'December 25' },
    ];

    for (const { month, day } of specialDates) {
      for (let i = 0; i < 10; i++) {
        const name = randomName();
        birthdays.push({
          name,
          date: formatDate(specificDate(month, day)),
          email: randomEmail(name),
          phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          notes: TEST_MARKER,
        });
      }
    }

    // 4. Create all birthdays
    console.log(`\n🚀 Uploading ${birthdays.length} birthdays to server...`);
    console.log('⏱️  Adding 200ms delay between requests to avoid rate limiting\n');

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < birthdays.length; i++) {
      try {
        await createBirthday(token, birthdays[i]);
        successCount++;

        if ((i + 1) % 10 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = ((i + 1) / (elapsed / 60)).toFixed(1);
          console.log(
            `Progress: ${i + 1}/${birthdays.length} | ${elapsed}s elapsed | ~${rate} req/min`
          );
        }

        // Add 200ms delay between requests to avoid rate limiting (5 req/sec = 300 req/min)
        // Server limit is 200 req per 15 min, so this keeps us well under the limit
        await sleep(200);
      } catch (error) {
        errorCount++;
        if (errorCount <= 3) {
          // Only show first 3 errors to avoid spam
          console.error(`❌ Error creating birthday #${i + 1}:`, error.message);
        }
        // Add longer delay after error (might be rate limit)
        await sleep(1000);
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Seeding complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Total birthdays: ${birthdays.length}`);
    console.log(`   - Successfully created: ${successCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Time taken: ${totalTime}s\n`);

    console.log(`🎉 Today's birthdays: 10 birthdays for ${todayFormatted}`);

    console.log(`\n🎯 Special dates with 10 birthdays:`);
    specialDates.forEach(({ name }) => console.log(`   - ${name}`));

    console.log(`\n👤 Test User Credentials:`);
    console.log(`   - Email: ${TEST_USER.email}`);
    console.log(`   - Password: ${TEST_USER.password}`);

    console.log(`\n💡 To view the data:`);
    console.log(`   1. Login with the test user credentials above`);
    console.log(`   2. Check the "Today" tab to see today's 10 birthdays`);
    console.log(`   3. Navigate to the calendar view to see the special dates\n`);

    console.log(`🗑️  To delete all test data:`);
    console.log(`   npm run clean\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('\nMake sure your server is running on:', API_BASE);
    process.exit(1);
  }
}

// Run the script
seedTestData();
