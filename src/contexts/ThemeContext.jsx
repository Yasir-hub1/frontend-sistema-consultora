import { createContext, useContext, useReducer, useEffect } from 'react'

export const ThemeContext = createContext()

const initialState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarCollapsed: false
}

function themeReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      }
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      }
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload
      }
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      }
    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload
      }
    case 'TOGGLE_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      }
    default:
      return state
  }
}

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState)

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedSidebarOpen = localStorage.getItem('sidebarOpen')
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')

    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme })
    }

    if (savedSidebarOpen !== null) {
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: savedSidebarOpen === 'true' })
    }

    if (savedSidebarCollapsed !== null) {
      dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: savedSidebarCollapsed === 'true' })
    }
  }, [])

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement
    
    if (state.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [state.theme])

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('theme', state.theme)
    localStorage.setItem('sidebarOpen', state.sidebarOpen.toString())
    localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString())
  }, [state.theme, state.sidebarOpen, state.sidebarCollapsed])

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' })
  }

  const setSidebarOpen = (open) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open })
  }

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed })
  }

  const toggleSidebarCollapsed = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' })
  }

  const value = {
    ...state,
    setTheme,
    toggleTheme,
    setSidebarOpen,
    toggleSidebar,
    setSidebarCollapsed,
    toggleSidebarCollapsed
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
