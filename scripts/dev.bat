@echo off
REM Eden Parfum Development Scripts for Windows
REM Usage: .\dev.bat [command]

setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

REM Colors for output (Windows CMD)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Helper functions
:log_info
echo [94mℹ️  %~1[0m
goto :eof

:log_success
echo [92m✅ %~1[0m
goto :eof

:log_warning
echo [93m⚠️  %~1[0m
goto :eof

:log_error
echo [91m❌ %~1[0m
goto :eof

REM Check if command exists
:command_exists
where "%~1" >nul 2>nul
goto :eof

REM Setup development environment
:setup
call :log_info "Setting up development environment..."

REM Check prerequisites
where node >nul 2>nul
if %errorlevel% neq 0 (
    call :log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    call :log_error "npm is not installed. Please install npm first."
    exit /b 1
)

REM Install dependencies
call :log_info "Installing root dependencies..."
npm install
if %errorlevel% neq 0 exit /b 1

call :log_info "Installing backend dependencies..."
cd "%PROJECT_ROOT%\backend"
npm install
if %errorlevel% neq 0 exit /b 1

call :log_info "Installing frontend dependencies..."
cd "%PROJECT_ROOT%\frontend"
npm install
if %errorlevel% neq 0 exit /b 1

cd "%PROJECT_ROOT%"

REM Check for .env file
if not exist "backend\.env" (
    call :log_warning "Backend .env file not found. Copying from template..."
    copy "backend\.env.example" "backend\.env" >nul
    call :log_warning "Please edit backend\.env with your Supabase credentials"
)

call :log_success "Development environment setup complete!"
call :log_info "Next steps:"
echo   1. Edit backend\.env with your Supabase credentials
echo   2. Run database migrations: npm run migrate:supabase
echo   3. Start development: npm run dev
goto :eof

REM Start development servers
:dev
call :log_info "Starting development servers..."

REM Check if concurrently is installed
npm list concurrently >nul 2>nul
if %errorlevel% neq 0 (
    call :log_warning "Installing concurrently for development..."
    npm install --save-dev concurrently
)

REM Start both frontend and backend
npm run dev
goto :eof

REM Run tests
:test
call :log_info "Running tests..."

REM Backend tests
call :log_info "Running backend tests..."
cd "%PROJECT_ROOT%\backend"
npm test
if %errorlevel% neq 0 (
    call :log_error "Backend tests failed"
    exit /b 1
)
call :log_success "Backend tests passed"

REM Integration tests
call :log_info "Running integration tests..."
cd "%PROJECT_ROOT%\tests"
node test_api.js
if %errorlevel% neq 0 (
    call :log_error "API tests failed"
    exit /b 1
)
node test_supabase.js
if %errorlevel% neq 0 (
    call :log_error "Supabase tests failed"
    exit /b 1
)
call :log_success "Integration tests passed"

cd "%PROJECT_ROOT%"
call :log_success "All tests passed!"
goto :eof

REM Run database migrations
:migrate
call :log_info "Running database migrations..."

if not exist "backend\.env" (
    call :log_error "Backend .env file not found. Please run setup first."
    exit /b 1
)

cd "%PROJECT_ROOT%\database"
node migrate.js
if %errorlevel% neq 0 (
    call :log_error "Database migration failed"
    exit /b 1
)
call :log_success "Database migration completed"
goto :eof

REM Clean up temporary files
:clean
call :log_info "Cleaning up temporary files..."

set /p "choice=Remove node_modules directories? (y/N): "
if /i "!choice!"=="y" (
    call :log_info "Removing node_modules..."
    rmdir /s /q "%PROJECT_ROOT%\node_modules" 2>nul
    rmdir /s /q "%PROJECT_ROOT%\backend\node_modules" 2>nul
    rmdir /s /q "%PROJECT_ROOT%\frontend\node_modules" 2>nul
    call :log_success "node_modules removed"
)

REM Remove logs
call :log_info "Removing log files..."
for /r "%PROJECT_ROOT%" %%f in (*.log) do del "%%f" 2>nul
call :log_success "Log files removed"

REM Remove backup files
call :log_info "Removing backup files..."
for /r "%PROJECT_ROOT%" %%f in (*.backup*) do del "%%f" 2>nul
for /r "%PROJECT_ROOT%" %%f in (*.tmp) do del "%%f" 2>nul
call :log_success "Backup files removed"

REM Clear npm cache
call :log_info "Clearing npm cache..."
npm cache clean --force >nul 2>nul
call :log_success "npm cache cleared"
goto :eof

REM Build for production
:build
call :log_info "Building for production..."

REM Build backend (if needed)
call :log_info "Preparing backend..."
cd "%PROJECT_ROOT%\backend"
npm run build >nul 2>nul
if %errorlevel% equ 0 (
    call :log_info "Backend built successfully"
) else (
    call :log_info "No build script for backend"
)

REM Frontend is static, no build needed
call :log_info "Frontend is ready (static files)"

cd "%PROJECT_ROOT%"
call :log_success "Build complete!"
goto :eof

REM Show help
:help
echo Eden Parfum Development Scripts for Windows
echo.
echo Usage: .\dev.bat [command]
echo.
echo Commands:
echo   setup     Set up development environment
echo   dev       Start development servers
echo   test      Run all tests
echo   migrate   Run database migrations
echo   clean     Clean up temporary files
echo   build     Build for production
echo   help      Show this help message
echo.
echo Examples:
echo   .\dev.bat setup    # Initial setup
echo   .\dev.bat dev      # Start development
echo   .\dev.bat test     # Run tests
goto :eof

REM Main script logic
if "%1"=="" goto help
if "%1"=="setup" goto setup
if "%1"=="dev" goto dev
if "%1"=="test" goto test
if "%1"=="migrate" goto migrate
if "%1"=="clean" goto clean
if "%1"=="build" goto build
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help

call :log_error "Unknown command: %1"
echo.
goto help</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\scripts\dev.bat