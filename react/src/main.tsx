import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth } from './pages/Auth'
import { Collection } from './pages/Collection'
import { Admin } from './pages/Admin'
import { Projects } from './pages/Projects'
import { About } from './pages/About'
import { Profile } from './pages/Profile'
import { TerminalLayout } from './components/layouts/TerminalLayout'
import { AuthProvider } from './hooks/AuthContext'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <TerminalLayout>
        <Auth />
      </TerminalLayout>
    ),
  },
  {
    path: "/collection",
    element: (
      <TerminalLayout>
        <Collection />
      </TerminalLayout>
    ),
  },
  {
    path: "/collection/:folderId",
    element: (
      <TerminalLayout>
        <Collection />
      </TerminalLayout>
    ),
  },
  {
    path: "/admin",
    element: (
      <TerminalLayout>
        <Admin />
      </TerminalLayout>
    ),
  },
  {
    path: "/projects",
    element: (
      <TerminalLayout>
        <Projects />
      </TerminalLayout>
    ),
  },
  {
    path: "/profile",
    element: (
      <TerminalLayout>
        <Profile />
      </TerminalLayout>
    ),
  },
  {
    path: "/about",
    element: (
      <TerminalLayout>
        <About />
      </TerminalLayout>
    ),
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)