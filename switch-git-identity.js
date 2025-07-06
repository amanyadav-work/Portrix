const { execSync } = require('child_process');

const mode = process.argv[2]; // "personal" or "company"

if (!['personal', 'company'].includes(mode)) {
  console.error('❌ Usage: node switch-git-identity.js [personal|company]');
  process.exit(1);
}

const configs = {
  personal: {
    name: 'amanyadav-work',
    email: 'amansyadavwork@gmail.com',
  },
  company: {
    name: 'amanyadav-work',
    email: 'amanyadav@turingx.in',
  },
};

const { name, email } = configs[mode];

try {
  execSync(`git config user.name "${name}"`);
  execSync(`git config user.email "${email}"`);

  console.log(`✅ Git identity set to ${mode.toUpperCase()}`);
  console.log(`   Name : ${name}`);
  console.log(`   Email: ${email}`);
} catch (err) {
  console.error('❌ Failed to update Git config:', err.message);
}
