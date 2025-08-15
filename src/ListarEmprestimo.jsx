import React from "react";

function ListaEmprestimos({ emprestimos }) {
  return (
    <div>
      <h3>Lista de Empréstimos</h3>
      <ul>
        {emprestimos.map((item, index) => (
          <li key={index}>
            Livro: {item.livro} | Aluno: {item.aluno} | Data: {item.data}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaEmprestimos;
