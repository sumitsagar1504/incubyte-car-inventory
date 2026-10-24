import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://localhost:5173',...devices['Desktop Chrome']},webServer:[{command:'npm run dev:api',url:'http://localhost:4000/api/health',reuseExistingServer:true},{command:'npm run dev:web',url:'http://localhost:5173',reuseExistingServer:true}],timeout:30000});
