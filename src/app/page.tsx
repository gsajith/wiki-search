import SearchBox from "@/components/SearchBox";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 pt-24 sm:pt-32">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Wiki Search</h1>
      <SearchBox />
    </main>
  );
}
