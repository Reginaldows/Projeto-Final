import React from "react";

function ListaReservas({ reservas }) {
  return (
    <div>
      <h3>Lista de Reservas</h3>
      <ul>
        {reservas.map((item, index) => (
          <li key={index}>
            Livro: {item.livro} | Aluno: {item.aluno} | Data: {item.data}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaReservas;
