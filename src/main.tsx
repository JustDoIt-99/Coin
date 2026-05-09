import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RouterProvider} from "react-router-dom";
import {router} from "./router.tsx";
import { Global, css } from "@emotion/react";

const queryClient = new QueryClient();

const globalStyles = css`
        * {
          box-sizing: border-box;
        }
        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }
        body {
          background: #eef1f6;
          font-family: sans-serif;
        }
        button,
        input {
          font: inherit;
        }
      `;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Global
          styles={globalStyles}
      />
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
)
