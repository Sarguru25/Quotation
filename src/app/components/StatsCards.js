export default function StatsCards({ total, draft, sent, approved }) {
  const Card = ({ title, value }) => (
    <div className="bg-white shadow rounded-2xl p-4">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="Total" value={total} />
      <Card title="Draft" value={draft} />
      <Card title="Sent" value={sent} />
      <Card title="Approved" value={approved} />
    </div>
  );
}