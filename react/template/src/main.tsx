import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './core/redux/store'
import { base_path } from './environment'
import ALLRoutes from './routes/router'
import { BrowserRouter } from 'react-router'
import DynamicTitle from './routes/dynamicTitle'
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "../node_modules/@tabler/icons-webfont/dist/tabler-icons.css";
import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "./index.scss"



createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <Provider store={store}>
    <BrowserRouter basename={base_path}>
      <ALLRoutes />
      <DynamicTitle/>
    </BrowserRouter>
    </Provider>
  </StrictMode>
)
