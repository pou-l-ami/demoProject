// src/pages/admin/EditStock.jsx
import React, { useState } from "react";
import "../../styles/admin-tables.css";

const defaultItems = [
  { id: 1, name: "Stage Lights", category: "Decoration", qty: 10, price: 800 },
  { id: 2, name: "Round Tables", category: "Furniture", qty: 20, price: 300 },
  { id: 3, name: "Buffet Counters", category: "Catering", qty: 5, price: 1500 },
];

const EditStock = () => {
  const [items, setItems] = useState(defaultItems);
  const [form, setForm] = useState({
    name: "",
    category: "",
    qty: "",
    price: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.qty || !form.price) return;

    const newItem = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      qty: Number(form.qty),
      price: Number(form.price),
    };

    setItems((prev) => [...prev, newItem]);
    setForm({ name: "", category: "", qty: "", price: "" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this item from stock?")) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-card">
      <h2>Manage Rental Stock</h2>
      <p className="subtitle">
        Add or update items you rent out – lights, furniture, equipment, etc.
      </p>

      <form
        onSubmit={handleAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "0.6rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Item name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Quantity"
          name="qty"
          value={form.qty}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Price / Day (₹)"
          name="price"
          value={form.price}
          onChange={handleChange}
        />
        <button type="submit">Add Item</button>
      </form>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price / Day (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.category}</td>
                <td>{it.qty}</td>
                <td>{it.price}</td>
                <td>
                  <button onClick={() => handleDelete(it.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>No stock items added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditStock;

