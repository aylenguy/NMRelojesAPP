import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://localhost:7247";

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    sales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Ajustá estos endpoints a lo que te provea el backend
        const [pRes, uRes, oRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/Product/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/User/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/Order/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [p, u, o] = await Promise.all([
          pRes.json(),
          uRes.json(),
          oRes.json(),
        ]);

        // Si no existen endpoints de count, podes caer en fetch a list y usar length
        setStats({
          products: p.count ?? p,
          users: u.count ?? u,
          orders: o.count ?? o,
          sales: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <div>Cargando métricas...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Productos</p>
          <p className="text-2xl font-bold">{stats.products}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Usuarios</p>
          <p className="text-2xl font-bold">{stats.users}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Pedidos</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Ventas</p>
          <p className="text-2xl font-bold">{stats.sales}</p>
        </div>
      </div>
    </div>
  );
}
