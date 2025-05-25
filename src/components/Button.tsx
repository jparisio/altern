"use client";
import { useRouter } from "next/navigation";
export default function Button({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const handleClick = () => {
    router.push("/api/auth/spotify");
  };
  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${className}`}
    >
      {children}
    </button>
  );
}
