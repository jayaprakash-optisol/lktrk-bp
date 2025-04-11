// This import method works with both ESM and CommonJS modules
import * as fs from 'fs';
import scanner from 'sonarqube-scanner';

// Read package.json
const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
const packageJson = JSON.parse(packageJsonContent);

// Read environment variables with defaults
const sonarUrl = process.env.SONAR_SERVER_URL || 'http://localhost:9000';

scanner(
  {
    serverUrl: sonarUrl,
    options: {
      'sonar.projectName': packageJson.name,
      'sonar.projectDescription': packageJson.description,
      'sonar.projectVersion': packageJson.version,
      'sonar.projectKey': packageJson.name,
      'sonar.login': process.env.SONAR_LOGIN || 'admin',
      'sonar.password': process.env.SONAR_PASSWORD || 'admin@123',
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.testExecutionReportPaths': 'coverage/test-report.xml',

      // Rules to avoid duplicate coverage reporting
      'sonar.projectBaseDir': '.',
      'sonar.exclusions': 'node_modules/**,coverage/**,dist/**,tests/**',
      'sonar.coverage.exclusions':
        'tests/**,src/database/scripts/**,src/index.ts,src/utils/swagger.ts,src/models/**,**/*seed.ts',

      // Exclude test files and seed files from duplication detection
      'sonar.cpd.exclusions':
        'tests/**,**/*.test.ts,**/*.spec.ts,**/*seed.ts,**/seed.ts,src/database/scripts/seed.ts,src/database/scripts/**/*seed*.ts',

      // Define rules to separate web and mobile components
      'sonar.issue.ignore.multicriteria': 'webMobile',
      'sonar.issue.ignore.multicriteria.webMobile.resourceKey': 'src/routes/mobile/**/*',
      'sonar.issue.ignore.multicriteria.webMobile.ruleKey': 'src/routes/web/**/*',
    },
  },
  () => process.exit(),
);
