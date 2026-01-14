import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef, useCallback } from "react"

interface RobertoAIProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  buttonColor?: string
  apiEndpoint?: string
  systemPrompt?: string
  voiceName?: string
}

export function RobertoAI({
  position = "bottom-right",
  buttonColor = "#e60000",
  apiEndpoint = "http://localhost:3000/api/chat",
  systemPrompt = "You are Roberto, a helpful AI assistant. Respond concisely and helpfully.",
  voiceName = ""
}: RobertoAIProps = {}) {
  const [isListening, setIsListening] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const recognitionActive = useRef(false)
  const synthRef = useRef<any>(null)
  const requestInFlightRef = useRef(false)

  // Function to speak text using Web Speech API
  const speakResponse = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1
      
      // Set voice if specified
      if (voiceName) {
        const voices = window.speechSynthesis.getVoices()
        const selectedVoice = voices.find(v => v.name === voiceName)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }, [voiceName])

  // Function to get AI response from backend
  const getAIResponse = useCallback(async (text: string) => {
    if (!text.trim()) return ""
    try {
      setIsProcessing(true)
      
      // Ensure API endpoint has https:// protocol
      let endpoint = apiEndpoint
      if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        endpoint = 'https://' + endpoint
      }
      
      console.log('Calling API endpoint:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          systemPrompt: systemPrompt,
        }),
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(`API returned status ${response.status}`)
      }
      
      const data = await response.json()
      return data.response || "I couldn't process that request."
    } catch (error) {
      console.error('Error getting AI response:', error)
      return "Sorry, I'm having trouble connecting to the AI service. Error: " + (error as Error).message
    } finally {
      setIsProcessing(false)
    }
  }, [apiEndpoint, systemPrompt])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = navigator.language || 'en-US'

        recognition.onresult = async (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('')
          
          setResponseText(transcript)

          // Only process final results and prevent duplicate requests
          if (event.results[event.results.length - 1].isFinal && !requestInFlightRef.current) {
            requestInFlightRef.current = true
            try {
              const aiResponse = await getAIResponse(transcript)
              setResponseText(prev => `${prev}\n\nAI: ${aiResponse}`)
              // Speak the AI response
              speakResponse(aiResponse)
            } finally {
              requestInFlightRef.current = false
            }
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsListening(false)
          setIsProcessing(false)
        }

        recognitionRef.current = recognition
      }
      
      // Load available voices
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          const voices = window.speechSynthesis.getVoices()
          console.log('Available voices:', voices.map(v => v.name))
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [getAIResponse, speakResponse])

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!recognitionRef.current) {
      console.error('Speech recognition not supported')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      recognitionActive.current = false
      setIsListening(false)
    } else {
      // Reset state and prevent requests during previous session
      requestInFlightRef.current = false
      setResponseText("Listening...")
      recognitionRef.current.start()
      recognitionActive.current = true
      setIsListening(true)
    }
  }

  const closeOverlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionActive.current = false
    }
    setIsListening(false)
  }

  // Handle keyboard shortcut (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggleListening(e as any)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isListening])

  // Position mapping
  const getPositionStyles = () => {
    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
    }
    
    switch(position) {
      case 'bottom-left':
        return { ...styles, bottom: '2rem', left: '2rem' }
      case 'top-right':
        return { ...styles, top: '2rem', right: '2rem' }
      case 'top-left':
        return { ...styles, top: '2rem', left: '2rem' }
      default: // bottom-right
        return { ...styles, bottom: '2rem', right: '2rem' }
    }
  }

  return (
    <div style={getPositionStyles()}>
      <button 
        onClick={toggleListening}
        className={`voice-button ${isListening ? 'active' : ''}`}
        style={{
          ...buttonStyle,
          backgroundColor: buttonColor,
          boxShadow: `0 4px 20px ${buttonColor}4d`,
        }}
        aria-label="Toggle voice assistant"
        disabled={isProcessing}
      >
        <svg 
          className="mic-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={iconStyle}
        >
          <rect x="9" y="2" width="6" height="12" rx="3" fill="white" stroke="none" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" fill="none" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="white" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="white" />
          <path d="M7 8s-1-1-1-4 1-4 1-4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M17 8s1-1 1-4-1-4-1-4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M5 10s-2-2-2-6 2-6 2-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M19 10s2-2 2-6-2-6-2-6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>
        {isProcessing && <div className="pulse-ring"></div>}
      </button>

      <div 
        className={`voice-overlay ${isListening ? 'active' : ''}`} 
        style={overlayStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wave-container" style={waveContainerStyle}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={`wave-line-${i}`}
              className="wave-line"
              style={{
                ...waveLineStyle,
                top: `${15 + (i * 15)}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.8 - (i * 0.1)
              }}
            />
          ))}
        </div>

        <div className="wave-center" style={waveCenterStyle}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={`wave-circle-${i}`}
              className="wave-circle"
              style={{
                ...waveCircleStyle,
                animationDelay: `${i * 0.4}s`,
                opacity: 1 - (i * 0.2),
                borderWidth: i === 1 ? '2px' : '1px'
              }}
            />
          ))}
        </div>

        <div className="status-indicator" style={statusContainerStyle}>
          <div className="status-dot" style={statusDotStyle}></div>
          <div className="status-text" style={statusTextStyle}>
            {isProcessing ? "Processing..." : "Listening..."}
          </div>
          <button 
            className="close-btn"
            onClick={closeOverlay}
            style={closeButtonStyle}
            aria-label="Close voice assistant"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sponken-response" style={responseContainerStyle}>
          <p style={responseTextStyle}>
            <span>{responseText || "Speak now..."}</span>
          </p>
        </div>

        <div className="particles" style={particlesStyle}></div>
      </div>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .pulse-ring {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid #e60000;
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-out infinite;
          pointer-events: none;
        }

        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 4px 20px rgba(230, 0, 0, 0.3); 
          }
          50% { 
            box-shadow: 0 8px 40px rgba(230, 0, 0, 0.6); 
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        @keyframes wave-flow {
          0% {
            transform: translateX(-100%) scaleX(0.5);
            opacity: 0;
          }
          50% {
            transform: translateX(0%) scaleX(1.2);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scaleX(0.5);
            opacity: 0;
          }
        }

        @keyframes wave-ripple {
          0% {
            width: 40px;
            height: 40px;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes particle-float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes container-breathe {
          0%, 100% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.1) contrast(1.05); }
        }

        @keyframes wave-shimmer {
          0%, 100% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 1;
            transform: translateX(100%);
          }
        }

        .voice-button {
          position: fixed;
          bottom: 8rem;
          right: 2rem;
          width: 72px;
          height: 72px;
          background: #e60000;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(230, 0, 0, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(230, 0, 0, 0.4);
        }

        .voice-button.active {
          animation: pulse-glow 2s infinite;
          transform: scale(1.1);
        }

        .voice-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .voice-button::before {
          content: "";
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(230, 0, 0, 0.3) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .voice-button.active::before {
          opacity: 1;
          animation: ripple 2s infinite;
        }

        .mic-icon {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .voice-button:hover .mic-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .voice-button.active .mic-icon {
          animation: mic-pulse 2s ease-in-out infinite;
        }

        .voice-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(8px);
          z-index: 500;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .voice-overlay.active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .status-indicator {
          position: absolute;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem;
          border-radius: 50px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 501;
        }

        .sponken-response {
          position: absolute;
          top: 9rem;
          left: 50%;
          max-width: 100%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem;
          border-radius: 50px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 501;
          max-width: 80%;
          text-align: center;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #e60000;
          border-radius: 50%;
          position: relative;
          animation: pulse-dot 2s infinite;
        }

        .status-dot::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #e60000;
          animation: ping 2s infinite;
        }

        .status-text {
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          transition: background 0.2s ease;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .wave-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(230, 0, 0, 0.6) 25%,
            rgba(255, 51, 51, 0.8) 50%,
            rgba(230, 0, 0, 0.6) 75%,
            transparent 100%
          );
          animation: wave-flow 4s ease-in-out infinite;
          transform-origin: left center;
        }

        .wave-line::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: wave-shimmer 3s ease-in-out infinite;
        }

        .wave-circle {
          position: absolute;
          border: 2px solid #e60000;
          border-radius: 50%;
          animation: wave-ripple 3s ease-out infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .particles {
          position: absolute;
          inset: 0;
          background: radial-gradient(
              circle at 30% 20%,
              rgba(230, 0, 0, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 70% 80%,
              rgba(255, 51, 51, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 20% 70%,
              rgba(230, 0, 0, 0.06) 0%,
              transparent 50%
            );
          animation: particle-float 6s ease-in-out infinite alternate;
          z-index: -1;
        }

        @media (max-width: 768px) {
          .voice-button {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 64px;
            height: 64px;
          }

          .mic-icon {
            width: 28px;
            height: 28px;
          }

          .status-indicator {
            top: 6rem;
            padding: 0.75rem 1.5rem;
          }

          .sponken-response {
            top: 1rem;
            padding: 0.75rem 1.5rem;
            width: calc(100% - 3rem);
            font-size: 0.9rem;
          }

          .wave-center {
            width: 250px;
            height: 250px;
          }
        }

        .voice-overlay.active .wave-container {
          animation: container-breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Styles
const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  zIndex: 1000,
}

const buttonStyle: React.CSSProperties = {
  position: 'relative',
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  backgroundColor: '#e60000',
  border: '3px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(230, 0, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1001,
}

const iconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  zIndex: 500,
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  pointerEvents: 'none',
}

const statusContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  padding: '1rem 2rem',
  borderRadius: '50px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  zIndex: 501,
}

const statusDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#e60000',
  position: 'relative',
}

const statusTextStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#333',
  fontWeight: 600,
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  padding: '0.25rem',
  borderRadius: '50%',
  transition: 'background 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const responseContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '9rem',
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: '80%',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  padding: '1rem 2rem',
  borderRadius: '50px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  zIndex: 501,
  textAlign: 'center',
}

const responseTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  color: '#333',
  lineHeight: 1.5,
}

const waveContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  zIndex: -1,
}

const waveCenterStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  height: '300px',
  zIndex: -1,
}

const waveLineStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '2px',
  background: 'linear-gradient(90deg, transparent 0%, rgba(230, 0, 0, 0.6) 25%, rgba(255, 51, 51, 0.8) 50%, rgba(230, 0, 0, 0.6) 75%, transparent 100%)',
  animation: 'wave-flow 4s ease-in-out infinite',
  transformOrigin: 'left center',
}

const waveCircleStyle: React.CSSProperties = {
  position: 'absolute',
  border: '2px solid #e60000',
  borderRadius: '50%',
  animation: 'wave-ripple 3s ease-out infinite',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}

const particlesStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 30% 20%, rgba(230, 0, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 51, 51, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(230, 0, 0, 0.06) 0%, transparent 50%)',
  animation: 'particle-float 6s ease-in-out infinite alternate',
  zIndex: -1,
}

// Framer property controls
addPropertyControls(RobertoAI, {
  position: {
    type: ControlType.Enum,
    title: "Position",
    options: ["bottom-right", "bottom-left", "top-right", "top-left"],
    optionTitles: ["Bottom Right", "Bottom Left", "Top Right", "Top Left"],
    defaultValue: "bottom-right",
  },
  buttonColor: {
    type: ControlType.Color,
    title: "Button Color",
    defaultValue: "#e60000",
  },
  apiEndpoint: {
    type: ControlType.String,
    title: "API Endpoint",
    defaultValue: "http://localhost:3000/api/chat",
    displaySegmentedControl: false,
  },
  systemPrompt: {
    type: ControlType.String,
    title: "System Prompt",
    defaultValue: "You are Roberto, a helpful AI assistant. Respond concisely and helpfully.",
    displaySegmentedControl: false,
  },
  voiceName: {
    type: ControlType.String,
    title: "Voice",
    placeholder: "Default system voice",
    displaySegmentedControl: false,
  },
})