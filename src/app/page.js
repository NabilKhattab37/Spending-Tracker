'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
import Dashboard from "@/app/(Pages)/Dashboard/page";

export default function Home() {
  return (
      <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <main>
              <Dashboard></Dashboard>
          </main>
      </ThemeProvider>
  )
}
