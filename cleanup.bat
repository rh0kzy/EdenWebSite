@echo off
echo Cleaning up unnecessary files...

REM Root level files
del /F /Q "test_catalog_data.html" 2>nul
del /F /Q "render-simple.yaml" 2>nul
del /F /Q "simple-server.js" 2>nul
del /F /Q "FIX_404_ERRORS.md" 2>nul
del /F /Q "NETLIFY_FIX_GUIDE.md" 2>nul
del /F /Q "NETLIFY_FUNCTIONS_README.md" 2>nul
del /F /Q "DEPLOYMENT_README.md" 2>nul

REM Config folder
rmdir /S /Q "config" 2>nul

REM Frontend test files
del /F /Q "frontend\api-test.html" 2>nul
del /F /Q "frontend\catalog-diagnostic.html" 2>nul
del /F /Q "frontend\catalog-display-test.html" 2>nul
del /F /Q "frontend\debug-api.html" 2>nul
del /F /Q "frontend\debug-catalog.html" 2>nul
del /F /Q "frontend\real-time-test.html" 2>nul
del /F /Q "frontend\test-social-integration.html" 2>nul
del /F /Q "frontend\image-speed-demo.html" 2>nul
del /F /Q "frontend\final-test.js" 2>nul
del /F /Q "frontend\verify-catalog.js" 2>nul
del /F /Q "frontend\verify-final.js" 2>nul
del /F /Q "frontend\url-test.js" 2>nul
del /F /Q "frontend\netlify-debug.js" 2>nul
del /F /Q "frontend\netlify-fixes.js" 2>nul
del /F /Q "frontend\jest.config.js" 2>nul
del /F /Q "frontend\package.json" 2>nul

REM Tests folder
rmdir /S /Q "tests" 2>nul

REM Docs redundant files
del /F /Q "docs\PROJECT_ISSUES_REPORT.txt" 2>nul
del /F /Q "docs\database_summary.js" 2>nul

echo Done! Cleaned up unnecessary files.
echo Check FILES_TO_REMOVE.md for the list of removed files.
pause
