import AppleAuthButton from "@/components/AppleAuthButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Welcome to altern</h1>
        <p>transfer playlists from apple music to spotify</p>

        <AppleAuthButton />
      </div>
    </main>
  );
}
