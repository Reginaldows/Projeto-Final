import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {useEffect} from 'react'
import './style.css'
import Login from './Login'
import Cadastro from './cadastro';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { iniciarScript } from './script'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
