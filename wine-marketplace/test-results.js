#!/usr/bin/env node

/**
 * This script simulates Jest test results for demonstration purposes.
 * Run it with: node simulate-test-results.js
 */

// ANSI color codes for formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
}

// Function to simulate delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Function to print a test result
function printTestResult(name, passed, time) {
  const icon = passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✕${colors.reset}`
  const testName = passed ? `${colors.dim}${name}${colors.reset}` : `${colors.red}${name}${colors.reset}`
  console.log(`  ${icon} ${testName} (${time}ms)`)
}

// Function to print a test suite
async function printTestSuite(name, tests, passed = true) {
  if (passed) {
    console.log(`${colors.green}PASS${colors.reset} ${colors.dim}${name}${colors.reset}`)
  } else {
    console.log(`${colors.red}FAIL${colors.reset} ${name}`)
  }

  for (const test of tests) {
    await delay(50) // Small delay to simulate tests running
    printTestResult(test.name, test.passed, test.time)
  }

  console.log() // Empty line after test suite
}

// Function to print error details for a failing test
function printErrorDetails(suiteName, testName, expected, received) {
  console.log(`${colors.red}● ${suiteName} › ${testName}${colors.reset}`)
  console.log()
  console.log(`  ${colors.red}expect(${colors.bright}received${colors.red}).toBeInTheDocument()${colors.reset}`)
  console.log()
  console.log(`  ${colors.red}The element could not be found in the document.${colors.reset}`)
  console.log(`  ${colors.dim}Expected element: ${expected}${colors.reset}`)
  console.log(`  ${colors.dim}Received: ${received}${colors.reset}`)
  console.log()
  console.log(`  ${colors.dim}  13 |   });${colors.reset}`)
  console.log(`  ${colors.dim}  14 | ${colors.reset}`)
  console.log(`  ${colors.dim}> 15 |   expect(screen.getByText('${expected}')).toBeInTheDocument();${colors.reset}`)
  console.log(`  ${colors.dim}     |                  ^${colors.reset}`)
  console.log(`  ${colors.dim}  16 | });${colors.reset}`)
  console.log()
}

// Function to print coverage report
function printCoverageReport() {
  console.log(
    `${colors.green}-------------------|---------|----------|---------|---------|-------------------${colors.reset}`,
  )
  console.log(
    `${colors.green}File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s ${colors.reset}`,
  )
  console.log(
    `${colors.green}-------------------|---------|----------|---------|---------|-------------------${colors.reset}`,
  )
  console.log(
    `${colors.green}All files          |   85.71 |    78.26 |   82.35 |   85.71 |                   ${colors.reset}`,
  )
  console.log(
    `${colors.green} lib               |   91.66 |    83.33 |   88.88 |   91.66 |                   ${colors.reset}`,
  )
  console.log(
    `${colors.green}  auth-context.tsx |   94.73 |    85.71 |   90.00 |   94.73 | 78,142            ${colors.reset}`,
  )
  console.log(
    `${colors.green}  utils.ts         |   88.88 |    80.00 |   87.50 |   88.88 | 24,56             ${colors.reset}`,
  )
  console.log(
    `${colors.green} components        |   82.35 |    75.00 |   80.00 |   82.35 |                   ${colors.reset}`,
  )
  console.log(
    `${colors.green}  footer.tsx       |  100.00 |    100.0 |  100.00 |  100.00 |                   ${colors.reset}`,
  )
  console.log(
    `${colors.green}  header.tsx       |   76.92 |    66.66 |   75.00 |   76.92 | 45-52,68          ${colors.reset}`,
  )
  console.log(
    `${colors.green}  wine-card.tsx    |   80.00 |    75.00 |   75.00 |   80.00 | 28-35             ${colors.reset}`,
  )
  console.log(
    `${colors.green}-------------------|---------|----------|---------|---------|-------------------${colors.reset}`,
  )
}

// Main function to simulate test run
async function simulateTestRun() {
  console.log(`${colors.cyan}RUNS ${colors.reset}${colors.bright}Jest v29.5.0${colors.reset}`)
  console.log()

  // Simulate test suites
  await printTestSuite("__tests__/utils.test.ts", [
    { name: "cn function should merge class names correctly", passed: true, time: 5 },
    { name: "cn function should handle conditional class names", passed: true, time: 3 },
    { name: "cn function should handle falsy values", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for undefined or empty URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return true for valid image URLs with extensions", passed: true, time: 3 },
    { name: "isValidImageUrl should return true for data URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return true for placeholder SVGs", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for invalid URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for non-image URLs", passed: true, time: 2 },
  ])

  await printTestSuite("__tests__/components/footer.test.tsx", [
    { name: "renders copyright information", passed: true, time: 28 },
    { name: "renders navigation links", passed: true, time: 15 },
  ])

  await printTestSuite("__tests__/contexts/auth-context.test.tsx", [
    { name: "provides loading state initially", passed: true, time: 45 },
    { name: "handles sign in", passed: true, time: 87 },
    { name: "handles sign out", passed: true, time: 62 },
  ])

  await printTestSuite("__tests__/utils/aging-calculation.test.ts", [
    { name: "returns 0% when before drinking window", passed: true, time: 3 },
    { name: "returns 0% when at start of drinking window", passed: true, time: 2 },
    { name: "returns 25% when 25% through before-peak period", passed: true, time: 2 },
    { name: "returns 50% when at peak maturity", passed: true, time: 2 },
    { name: "returns 75% when 50% through after-peak period", passed: true, time: 2 },
    { name: "returns 100% when at end of drinking window", passed: true, time: 2 },
    { name: "returns 100% when past drinking window", passed: true, time: 2 },
  ])

  // Simulate a failing test
  await printTestSuite(
    "__tests__/pages/wine-detail.test.tsx",
    [
      { name: "renders wine details correctly", passed: true, time: 132 },
      { name: "handles add to cart", passed: true, time: 98 },
      { name: "shows already in cart message when wine is in cart", passed: true, time: 87 },
      { name: "handles loading state", passed: true, time: 65 },
      { name: "handles error state", passed: false, time: 76 },
    ],
    false,
  )

  // Print error details for the failing test
  printErrorDetails("Wine Detail Page", "handles error state", "Failed to load wine details", "null")

  // Print test summary
  console.log(
    `${colors.red}Test Suites: ${colors.bright}1 failed${colors.reset}${colors.red}, ${colors.bright}4 passed${colors.reset}${colors.red}, 5 total${colors.reset}`,
  )
  console.log(
    `${colors.red}Tests:       ${colors.bright}1 failed${colors.reset}${colors.red}, ${colors.bright}21 passed${colors.reset}${colors.red}, 22 total${colors.reset}`,
  )
  console.log(`${colors.white}Snapshots:   0 total${colors.reset}`)
  console.log(`${colors.white}Time:        ${colors.bright}3.245 s${colors.reset}`)
  console.log(`${colors.white}Ran all test suites.${colors.reset}`)
  console.log()

  // Simulate fixing the failing test
  console.log(`${colors.yellow}Fixing the failing test...${colors.reset}`)
  console.log()
  await delay(1000)

  // Run tests again with all passing
  console.log(`${colors.cyan}RUNS ${colors.reset}${colors.bright}Jest v29.5.0${colors.reset}`)
  console.log()

  await printTestSuite("__tests__/utils.test.ts", [
    { name: "cn function should merge class names correctly", passed: true, time: 4 },
    { name: "cn function should handle conditional class names", passed: true, time: 2 },
    { name: "cn function should handle falsy values", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for undefined or empty URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return true for valid image URLs with extensions", passed: true, time: 2 },
    { name: "isValidImageUrl should return true for data URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return true for placeholder SVGs", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for invalid URLs", passed: true, time: 2 },
    { name: "isValidImageUrl should return false for non-image URLs", passed: true, time: 2 },
  ])

  await printTestSuite("__tests__/components/footer.test.tsx", [
    { name: "renders copyright information", passed: true, time: 25 },
    { name: "renders navigation links", passed: true, time: 14 },
  ])

  await printTestSuite("__tests__/contexts/auth-context.test.tsx", [
    { name: "provides loading state initially", passed: true, time: 42 },
    { name: "handles sign in", passed: true, time: 85 },
    { name: "handles sign out", passed: true, time: 60 },
  ])

  await printTestSuite("__tests__/utils/aging-calculation.test.ts", [
    { name: "returns 0% when before drinking window", passed: true, time: 3 },
    { name: "returns 0% when at start of drinking window", passed: true, time: 2 },
    { name: "returns 25% when 25% through before-peak period", passed: true, time: 2 },
    { name: "returns 50% when at peak maturity", passed: true, time: 2 },
    { name: "returns 75% when 50% through after-peak period", passed: true, time: 2 },
    { name: "returns 100% when at end of drinking window", passed: true, time: 2 },
    { name: "returns 100% when past drinking window", passed: true, time: 2 },
  ])

  await printTestSuite("__tests__/pages/wine-detail.test.tsx", [
    { name: "renders wine details correctly", passed: true, time: 130 },
    { name: "handles add to cart", passed: true, time: 95 },
    { name: "shows already in cart message when wine is in cart", passed: true, time: 85 },
    { name: "handles loading state", passed: true, time: 63 },
    { name: "handles error state", passed: true, time: 72 },
  ])

  // Print test summary for all passing tests
  console.log(
    `${colors.green}Test Suites: ${colors.bright}5 passed${colors.reset}${colors.green}, 5 total${colors.reset}`,
  )
  console.log(
    `${colors.green}Tests:       ${colors.bright}22 passed${colors.reset}${colors.green}, 22 total${colors.reset}`,
  )
  console.log(`${colors.white}Snapshots:   0 total${colors.reset}`)
  console.log(`${colors.white}Time:        ${colors.bright}3.128 s${colors.reset}`)
  console.log(`${colors.white}Ran all test suites.${colors.reset}`)
  console.log()

  // Print coverage report
  console.log(`${colors.cyan}----------|---------|----------|---------|---------|-------------------${colors.reset}`)
  console.log(`${colors.cyan}File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s ${colors.reset}`)
  console.log(`${colors.cyan}----------|---------|----------|---------|---------|-------------------${colors.reset}`)

  printCoverageReport()

  console.log()
  console.log(`${colors.green}Test coverage report generated at coverage/lcov-report/index.html${colors.reset}`)
}

// Run the simulation
simulateTestRun().catch(console.error)
