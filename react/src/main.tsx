import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth } from './pages/Auth'
import { Collection } from './pages/Collection'
import { TerminalLayout } from './components/layouts/TerminalLayout'
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
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)