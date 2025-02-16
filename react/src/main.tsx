import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth } from './components/Auth'
import { Collection } from './components/Collection'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  {
    path: "/collection",
    element: <Collection />,
  },
  {
    path: "/collection/:folderId",
    element: <Collection />,
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)