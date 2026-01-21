export default function Topbar({ title }) {
  return (
    <header className="flex items-center justify-between bg-white h-16 px-4 border-b">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
