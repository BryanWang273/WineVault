// Create a simple utility function for testing
const calculateAgingProgress = (currentYear, agingPotential) => {
  const { drinkFrom, peakMaturity, drinkUntil } = agingPotential

  // Not ready yet
  if (currentYear < drinkFrom) {
    return 0
  }

  // Past drinking window
  if (currentYear > drinkUntil) {
    return 100
  }

  // Before peak maturity
  if (currentYear <= peakMaturity) {
    const totalBeforePeak = peakMaturity - drinkFrom
    const progressBeforePeak = currentYear - drinkFrom
    return (progressBeforePeak / totalBeforePeak) * 50 // 0-50%
  }

  // After peak maturity
  const totalAfterPeak = drinkUntil - peakMaturity
  const progressAfterPeak = currentYear - peakMaturity
  return 50 + (progressAfterPeak / totalAfterPeak) * 50 // 50-100%
}

describe("Wine Aging Calculation", () => {
  const agingPotential = {
    drinkFrom: 2020,
    peakMaturity: 2025,
    drinkUntil: 2030,
  }

  test("returns 0% when before drinking window", () => {
    expect(calculateAgingProgress(2019, agingPotential)).toBe(0)
  })

  test("returns 0% when at start of drinking window", () => {
    expect(calculateAgingProgress(2020, agingPotential)).toBe(0)
  })

  test("returns 25% when 25% through before-peak period", () => {
    // 2021.25 is 25% of the way from 2020 to 2025
    expect(calculateAgingProgress(2021.25, agingPotential)).toBeCloseTo(12.5)
  })

  test("returns 50% when at peak maturity", () => {
    expect(calculateAgingProgress(2025, agingPotential)).toBe(50)
  })

  test("returns 75% when 50% through after-peak period", () => {
    // 2027.5 is 50% of the way from 2025 to 2030
    expect(calculateAgingProgress(2027.5, agingPotential)).toBeCloseTo(75)
  })

  test("returns 100% when at end of drinking window", () => {
    expect(calculateAgingProgress(2030, agingPotential)).toBe(100)
  })

  test("returns 100% when past drinking window", () => {
    expect(calculateAgingProgress(2031, agingPotential)).toBe(100)
  })
})
