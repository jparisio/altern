import AppleAuthButton from "@/components/AppleAuthButton";
import FadeInText from "@/components/FadeInText";
import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">
      <div className="flex flex-col items-center justify-center">
        <FadeInText className="text-6xl font-bold">
          Welcome to altern
        </FadeInText>
        <FadeInText className="p-3">
          transfer playlists from apple music to spotify
        </FadeInText>
      </div>
      <AppleAuthButton />
      <LogoutButton />
    </main>
  );
}
