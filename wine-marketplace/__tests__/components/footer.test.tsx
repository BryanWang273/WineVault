import { render, screen } from "@testing-library/react"
import { Footer } from "../../components/footer"

describe("Footer Component", () => {
  test("renders copyright information", () => {
    render(<Footer />)

    // Check if the copyright text is present
    expect(screen.getByText(/© \d{4} Wine Aging Tracker/)).toBeInTheDocument()
  })

  test("renders navigation links", () => {
    render(<Footer />)

    // Check if important links are present
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /privacy/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /terms/i })).toBeInTheDocument()
  })
})
