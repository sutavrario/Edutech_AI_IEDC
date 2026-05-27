"use client";

import { useState, useEffect } from "react";
import { PageWrapper, AnimatedSection } from "@/components/shared/Wrappers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryButton } from "@/components/shared/Buttons";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { CLASS_OPTIONS, BOARD_OPTIONS } from "@/constants/theme";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    class_name: "",
    board: "",
    school_name: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        age: user.age ? user.age.toString() : "",
        class_name: user.class_name || "",
        board: user.board || "",
        school_name: user.school_name || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await fetchWithAuth('/users/profile', {
        method: "PUT",
        body: JSON.stringify({
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          class_name: formData.class_name,
          board: formData.board,
          school_name: formData.school_name,
        }),
      });
      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">Your Profile</h1>
        <p className="text-gray-600">Manage your personal information and academic details.</p>
      </div>

      <div className="max-w-3xl">
        <AnimatedSection>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-md font-medium uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
                {success && (
                  <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Profile updated successfully!
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-700">Full Name</Label>
                    <Input id="full_name" required value={formData.full_name} onChange={handleChange} className="bg-white border-gray-200 text-gray-900" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address (Read-only)</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-700">Age</Label>
                    <Input id="age" type="number" min="5" max="99" value={formData.age} onChange={handleChange} className="bg-white border-gray-200 text-gray-900" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school_name" className="text-gray-700">School Name</Label>
                    <Input id="school_name" value={formData.school_name} onChange={handleChange} placeholder="e.g. St. Xavier's High School" className="bg-white border-gray-200 text-gray-900" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="class_name" className="text-gray-700">Class</Label>
                    <select id="class_name" required value={formData.class_name} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-gray-900">
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

                <div className="pt-4 flex justify-end">
                  <PrimaryButton className="h-10 px-6" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
                    Save Changes
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PageWrapper>
  );
}
