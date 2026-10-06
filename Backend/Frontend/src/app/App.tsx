import AppRouter from "./router"
import { BrowserRouter } from "react-router-dom"

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}