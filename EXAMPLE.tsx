import React from "react"
import { RobertoAI } from "./RobertoAI"

/**
 * Example Framer Frame using Roberto AI Component
 * 
 * This example shows how to integrate the Roberto AI voice assistant
 * into your Framer website.
 */

export default function FramerPage() {
  return (
    <div style={styles.container}>
      {/* Your website content here */}
      <header style={styles.header}>
        <h1>Welcome to my Framer Site</h1>
        <p>Try clicking the red microphone button in the corner!</p>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2>About Roberto AI</h2>
          <p>
            Roberto AI is a voice-powered assistant that can answer your questions
            and help you navigate the website. Click the red microphone button to get started.
          </p>
          <h3>Features:</h3>
          <ul>
            <li>🎤 Voice recognition</li>
            <li>🤖 AI-powered responses</li>
            <li>⌨️ Keyboard shortcuts (Spacebar)</li>
            <li>📱 Mobile friendly</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Try These Commands</h2>
          <ul>
            <li>"What can you help me with?"</li>
            <li>"Tell me about your features"</li>
            <li>"How do you work?"</li>
            <li>"What is your purpose?"</li>
          </ul>
        </section>
      </main>

      {/* Roberto AI Component */}
      <RobertoAI
        // Set your backend endpoint - update this after deployment!
        apiEndpoint="http://localhost:3000/api/chat"
        
        // Customize the button color (hex color code)
        buttonColor="#e60000"
        
        // Position on the page
        position="bottom-right"
        
        // Customize how the AI behaves
        systemPrompt="You are Roberto, a helpful AI assistant. Be friendly, concise, and helpful. Respond in the same language as the user."
      />

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; 2024 My Framer Site. Powered by Roberto AI</p>
      </footer>
    </div>
  )
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f5f5f5",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "4rem 2rem",
    textAlign: "center" as const,
  },
  main: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    width: "100%",
  },
  section: {
    background: "white",
    padding: "2rem",
    marginBottom: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  footer: {
    background: "#333",
    color: "white",
    textAlign: "center" as const,
    padding: "2rem",
    marginTop: "4rem",
  },
}

/**
 * Configuration Guide
 * 
 * 1. LOCAL DEVELOPMENT:
 *    - Start backend: npm run dev
 *    - apiEndpoint: "http://localhost:3000/api/chat"
 * 
 * 2. PRODUCTION (Vercel):
 *    - Deploy backend to Vercel
 *    - apiEndpoint: "https://your-project.vercel.app/api/chat"
 * 
 * 3. PRODUCTION (Heroku):
 *    - Deploy backend to Heroku
 *    - apiEndpoint: "https://your-app.herokuapp.com/api/chat"
 * 
 * 4. CUSTOM SERVER:
 *    - Deploy backend to your server
 *    - apiEndpoint: "https://your-domain.com/api/chat"
 */

/**
 * Advanced Customization
 * 
 * You can create multiple Roberto instances with different configurations:
 */

export function AdvancedExample() {
  const [apiEndpoint, setApiEndpoint] = React.useState("http://localhost:3000/api/chat")

  return (
    <div>
      {/* Chat Assistant in English */}
      <RobertoAI
        apiEndpoint={apiEndpoint}
        buttonColor="#e60000"
        position="bottom-right"
        systemPrompt="You are a helpful customer support assistant. Answer questions about our products and services."
      />

      {/* Or customize for different use cases */}
      {/* 
      <RobertoAI
        apiEndpoint={apiEndpoint}
        buttonColor="#0066ff"
        position="bottom-left"
        systemPrompt="You are a technical support specialist. Help users with technical issues."
      />
      */}
    </div>
  )
}
