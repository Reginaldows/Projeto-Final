import React, { useState } from "react";
import { toast } from 'react-toastify';

toast.success("Empréstimo cadastrado com sucesso!");
toast.error("Erro ao cadastrar reserva!");


function EmprestimoForm({ onAdd }) {
  const [form, setForm] = useState({
    livro: "",
    aluno: "",
    data: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Empréstimo cadastrado com sucesso!', {
      position: "bottom-center"
    });
    if (!form.livro || !form.aluno || !form.data) return;
    onAdd(form);
    setForm({ livro: "", aluno: "", data: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Empréstimo</h2>
      <input name="livro" placeholder="Livro" value={form.livro} onChange={handleChange} />
      <input name="aluno" placeholder="Aluno" value={form.aluno} onChange={handleChange} />
      <input name="data" type="date" value={form.data} onChange={handleChange} />
      <button type="submit">Emprestar</button>
    </form>
  );
}

export default EmprestimoForm;
