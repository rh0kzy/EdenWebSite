# Files to Remove - Cleanup Analysis

## Root Level - Test/Debug/Redundant Files
- ❌ `test_catalog_data.html` - Test file
- ❌ `render-simple.yaml` - Unused deployment config
- ❌ `simple-server.js` - Replaced by backend/server.js
- ❌ `FIX_404_ERRORS.md` - Old fix documentation
- ❌ `NETLIFY_FIX_GUIDE.md` - Duplicate/old documentation
- ❌ `NETLIFY_FUNCTIONS_README.md` - Outdated documentation
- ❌ `DEPLOYMENT_README.md` - Duplicate (we have docs/DEPLOYMENT.md)

## Config Folder - Duplicate Netlify Configs
- ❌ `config/netlify-functions-example.toml` - Example config
- ❌ `config/netlify-simple.toml` - Duplicate config
- ❌ `config/netlify.toml` - Duplicate (we have netlify.toml in root)

## Frontend - Test/Debug/Diagnostic Files
- ❌ `frontend/api-test.html` - Test file
- ❌ `frontend/catalog-diagnostic.html` - Diagnostic test
- ❌ `frontend/catalog-display-test.html` - Test file
- ❌ `frontend/debug-api.html` - Debug test
- ❌ `frontend/debug-catalog.html` - Debug test
- ❌ `frontend/real-time-test.html` - Test file
- ❌ `frontend/test-social-integration.html` - Test file
- ❌ `frontend/image-speed-demo.html` - Demo file
- ❌ `frontend/final-test.js` - Test script
- ❌ `frontend/verify-catalog.js` - Verification script
- ❌ `frontend/verify-final.js` - Verification script
- ❌ `frontend/url-test.js` - Test script
- ❌ `frontend/netlify-debug.js` - Debug script
- ❌ `frontend/netlify-fixes.js` - Old fix script
- ❌ `frontend/jest.config.js` - Frontend shouldn't have Jest (backend has it)
- ❌ `frontend/package.json` - Frontend shouldn't have separate package.json

## Root Tests Folder - Old Test Files
- ❌ `tests/test_api.js` - Old test (backend has proper tests)
- ❌ `tests/test_supabase.js` - Old test (backend has proper tests)

## Docs - Redundant/Old Documentation
- ❌ `docs/PROJECT_ISSUES_REPORT.txt` - Old issue report
- ❌ `docs/database_summary.js` - Not documentation

## Keep These Files (Important)
- ✅ `README.md` - Main project readme
- ✅ `netlify.toml` - Active Netlify config
- ✅ `CATALOG_FIX_SUMMARY.md` - Recent fix documentation
- ✅ `docs/API.md` - API documentation
- ✅ `docs/DEPLOYMENT.md` - Deployment guide
- ✅ `docs/DEVELOPMENT_SETUP.md` - Dev setup guide
- ✅ `docs/PROJECT_STRUCTURE.md` - Project structure
- ✅ `docs/CONTRIBUTING.md` - Contribution guidelines
- ✅ All files in `backend/` - Active backend
- ✅ All files in `frontend/js/` - Active scripts
- ✅ All files in `frontend/css/` - Active styles
- ✅ Main HTML files (index.html, catalog.html, perfume-detail.html)

## Total Files to Remove: 28 files
