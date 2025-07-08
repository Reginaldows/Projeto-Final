# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Guia de Instalação e Execução do Projeto React + Vite + PHP

## Etapas para executar o projeto

1. **Pré-requisitos**
   - Instale o [Node.js](https://nodejs.org/)
   - Instale o [XAMPP](https://www.apachefriends.org/pt_br/index.html)
   - Instale o [Composer](https://getcomposer.org/)

2. **Clonar o projeto e abrir no VS Code**
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd SEU_REPOSITORIO
   code .

3. **Instalar depêndencias do projeto (node_modules)**
  Terminal: npm install

4. **Comando para rodar o projeto**
  Terminal: npm run dev

5. **Instalar depêndencias do PHPMailer**
   Entre na pasta php do projeto no terminal: 
   cd php
   composer install

6. **Criar uma pasta chamada php dentro de htdocs no xampp**
   Copiar a pasta vendor e mover para essa pasta php no xampp
   Criar as pasta css e img dentro da pasta php no xampp

7. **Comando para instalar para veificar as alterações no php, css e img**
   terminal: npm install --save-dev chokidar-cli

8. **Comando para iniciar a cópia automática dos arquivos acima para a pasta do xampp**
   Terminal: npm run watch

9. **Comando para a navegação entre as páginas**
   Terminal: npm install react-router-dom