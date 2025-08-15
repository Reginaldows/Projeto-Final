import React, { createContext, useState, useContext } from "react";

const BookContext = createContext();

export function BookProvider({ children }) {
  const [livros, setLivros] = useState([]);

  function adicionarLivro(novoLivro) {
    setLivros((prev) => [...prev, novoLivro]);
  }

  return (
    <BookContext.Provider value={{ livros, adicionarLivro }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  return useContext(BookContext);
}
