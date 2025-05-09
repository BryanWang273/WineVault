"use client"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "../../lib/auth-context"
import { mockSupabaseClient } from "../mocks/supabase"

// Create a test component that uses the auth context
const TestComponent = () => {
  const { user, signIn, signOut, isLoading } = useAuth()

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={() => signIn({ email: "test@example.com", password: "password" })}>Sign In</button>
        </>
      )}
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("provides loading state initially", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  test("handles sign in", async () => {
    // Mock successful sign in
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
      error: null,
    })

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })

    // Click sign in button
    const signInButton = screen.getByText("Sign In")
    await userEvent.click(signInButton)

    // Verify sign in was called
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    })

    // Wait for user to be logged in
    await waitFor(() => {
      expect(screen.getByText("Logged in as: test@example.com")).toBeInTheDocument()
    })
  })

  test("handles sign out", async () => {
    // Mock user is already logged in
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
      error: null,
    })

    // Mock successful sign out
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for user to be logged in
    await waitFor(() => {
      expect(screen.getByText("Logged in as: test@example.com")).toBeInTheDocument()
    })

    // Click sign out button
    const signOutButton = screen.getByText("Sign Out")
    await userEvent.click(signOutButton)

    // Verify sign out was called
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()

    // Wait for user to be logged out
    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })
  })
})
