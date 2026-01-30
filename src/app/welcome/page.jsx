"use client";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to RAID ARENA</h1>
      <p className="text-gray-400 mb-8">Mobile Esports Platform</p>

      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/auth/signup")}
          className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-3 rounded-lg"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
