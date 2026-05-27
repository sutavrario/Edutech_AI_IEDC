"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { BrainCircuit, Loader2, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/shared/Cards";
import { PrimaryButton } from "@/components/shared/Buttons";
import { PageWrapper } from "@/components/shared/Wrappers";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid credentials");
      }

      const data = await response.json();
      
      if (data.role !== "admin") {
        throw new Error("Access Denied: Admin privileges required.");
      }

      login(data.access_token, data.role);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BrainCircuit className="w-12 h-12 text-[#5A4BDA]" />
          </Link>
        </div>
        
        <AuthCard 
          title="Admin Portal Login" 
          description="Enter your administrator credentials to continue"
          icon={<ShieldCheck className="w-8 h-8 text-[#5A4BDA]" />}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edutech.com" 
                className="bg-white border-gray-200 text-gray-900" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-200 text-gray-900" 
              />
            </div>
            
            <div className="pt-4 flex flex-col gap-4">
              <PrimaryButton type="submit" className="w-full h-12 text-lg bg-[#5A4BDA] hover:bg-[#4A3BCA]" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Secure Login"}
              </PrimaryButton>
              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  Return to Student Login
                </Link>
              </div>
            </div>
          </form>
        </AuthCard>
      </div>
    </PageWrapper>
  );
}
