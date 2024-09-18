import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App';
import EntryPage from './components/EntryPage';


const checkAuth = () => {
  return localStorage.getItem("token") !== null;
}

const routes = [
  {
    path: "/",
    element: checkAuth() ? <App /> : <EntryPage />

  },
  {
    path: "/home",
    element: checkAuth() ? <App /> : <EntryPage />
  }
]

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
