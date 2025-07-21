@echo off
setlocal enabledelayedexpansion

REM TransferForm Test Runner Script (Windows)
REM This script runs the TransferForm.vue component tests with various options

echo 🧪 TransferForm.vue Test Runner
echo ================================

REM Check if npm is available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Handle command line arguments
if "%1"=="basic" goto run_basic
if "%1"=="watch" goto run_watch
if "%1"=="coverage" goto run_coverage
if "%1"=="verbose" goto run_verbose
if "%1"=="ui" goto run_ui
if "%1"=="all" goto run_all
if "%1"=="help" goto show_help
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help
if not "%1"=="" (
    echo [ERROR] Unknown argument: %1
    echo Use '%0 help' for usage information.
    exit /b 1
)

REM Interactive mode
:menu
echo.
echo Select test mode:
echo 1^) Basic test run
echo 2^) Watch mode ^(continuous testing^)
echo 3^) Coverage report
echo 4^) Verbose output
echo 5^) UI mode ^(browser interface^)
echo 6^) All modes ^(sequential^)
echo q^) Quit
echo.
set /p choice="Enter your choice: "

if "%choice%"=="1" goto run_basic
if "%choice%"=="basic" goto run_basic
if "%choice%"=="2" goto run_watch
if "%choice%"=="watch" goto run_watch
if "%choice%"=="3" goto run_coverage
if "%choice%"=="coverage" goto run_coverage
if "%choice%"=="4" goto run_verbose
if "%choice%"=="verbose" goto run_verbose
if "%choice%"=="5" goto run_ui
if "%choice%"=="ui" goto run_ui
if "%choice%"=="6" goto run_all
if "%choice%"=="all" goto run_all
if "%choice%"=="q" goto quit
if "%choice%"=="Q" goto quit
if "%choice%"=="quit" goto quit
if "%choice%"=="exit" goto quit

echo [WARNING] Invalid choice. Please try again.
goto menu

:run_basic
echo [INFO] Running basic tests...
echo ----------------------------------------
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed with exit code: %errorlevel%
)
echo ----------------------------------------
if "%1"=="basic" exit /b %errorlevel%
goto continue

:run_watch
echo [INFO] Running tests in watch mode...
echo [WARNING] Running in watch mode. Press 'q' to quit.
echo ----------------------------------------
npx vitest src/components/transfer/__tests__/TransferForm.test.ts
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed with exit code: %errorlevel%
)
echo ----------------------------------------
if "%1"=="watch" exit /b %errorlevel%
goto continue

:run_coverage
echo [INFO] Running tests with coverage report...
echo ----------------------------------------
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --coverage
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed with exit code: %errorlevel%
)
echo ----------------------------------------
if "%1"=="coverage" exit /b %errorlevel%
goto continue

:run_verbose
echo [INFO] Running tests with verbose output...
echo ----------------------------------------
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --reporter=verbose
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed with exit code: %errorlevel%
)
echo ----------------------------------------
if "%1"=="verbose" exit /b %errorlevel%
goto continue

:run_ui
echo [INFO] Opening Vitest UI...
echo [WARNING] Opening Vitest UI in browser...
echo ----------------------------------------
npx vitest --ui src/components/transfer/__tests__/TransferForm.test.ts
if %errorlevel% equ 0 (
    echo [SUCCESS] Tests completed successfully!
) else (
    echo [ERROR] Tests failed with exit code: %errorlevel%
)
echo ----------------------------------------
if "%1"=="ui" exit /b %errorlevel%
goto continue

:run_all
echo [INFO] Running all test modes sequentially...
echo [INFO] 1/3 - Basic test run...
call :run_basic_silent
echo [INFO] 2/3 - Verbose output...
call :run_verbose_silent
echo [INFO] 3/3 - Coverage report...
call :run_coverage_silent
if "%1"=="all" exit /b 0
goto continue

:run_basic_silent
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts
exit /b

:run_verbose_silent
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --reporter=verbose
exit /b

:run_coverage_silent
npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --coverage
exit /b

:show_help
echo Usage: %0 [mode]
echo.
echo Modes:
echo   basic     - Run tests once
echo   watch     - Run tests in watch mode
echo   coverage  - Run tests with coverage
echo   verbose   - Run tests with verbose output
echo   ui        - Open Vitest UI
echo   all       - Run all modes sequentially
echo   help      - Show this help
exit /b 0

:continue
echo.
pause
goto menu

:quit
echo [INFO] Goodbye!
exit /b 0
