'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
import Ttracker from "@/app/Components/Ttracker";

export default function Home() {
  return (
      <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <main>
              <section className="justify-center items-center p-24 flex">
                  <Ttracker className="flex items-center justify-between"></Ttracker>
              </section>
          </main>
      </ThemeProvider>
  )
}
