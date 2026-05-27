"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BrainCircuit, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/shared/Cards";
import { PrimaryButton } from "@/components/shared/Buttons";
import { PageWrapper } from "@/components/shared/Wrappers";
import { CLASS_OPTIONS, BOARD_OPTIONS } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    class: "",
    board: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          class_name: formData.class,
          board: formData.board,
          age: 15, // Defaulting or you can add an age input field
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed");
      }

      // Automatically login after signup
      const loginFormData = new URLSearchParams();
      loginFormData.append("username", formData.email);
      loginFormData.append("password", formData.password);

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginFormData,
      });

      if (!loginResponse.ok) {
        throw new Error("Signup successful, but login failed. Please login manually.");
      }

      const loginData = await loginResponse.json();
      login(loginData.access_token);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <PageWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BrainCircuit className="w-12 h-12 text-primary" />
          </Link>
        </div>
        
        <AuthCard
          title="Create an account"
          description="Join the platform for a better learning experience"
          icon={<BrainCircuit className="w-8 h-8 text-primary" />}
        >
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">First name</Label>
                <Input id="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" className="bg-white border-gray-200 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">Last name</Label>
                <Input id="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className="bg-white border-gray-200 text-gray-900" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="student@example.com" className="bg-white border-gray-200 text-gray-900" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-gray-700">Class</Label>
                <select id="class" required value={formData.class} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-gray-900">
                  <option value="" disabled>Select Class</option>
                  {CLASS_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="board" className="text-gray-700">Board</Label>
                <select id="board" required value={formData.board} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-gray-900">
                  <option value="" disabled>Select Board</option>
                  {BOARD_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input id="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="bg-white border-gray-200 text-gray-900" />
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <PrimaryButton type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
              </PrimaryButton>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </AuthCard>
      </div>
    </PageWrapper>
  );
}
