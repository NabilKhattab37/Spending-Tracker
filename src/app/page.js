'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
import Budget from "@/app/Components/Budget";

export default function Home() {
  return (
      <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <main>
              <section className="justify-center items-center p-24 flex">
                  <Budget className="flex items-center justify-between"></Budget>
              </section>
          </main>
      </ThemeProvider>
  )
}
