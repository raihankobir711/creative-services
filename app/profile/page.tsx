"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setFullName(data?.full_name || "");
setPhone(data?.phone || "");
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }
const handleSave = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone,
    })
    .eq("id", user.id);

  if (error) {
    alert(error.message);
  } else {
    alert("Profile updated successfully!");
  }
};
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <div className="mt-8 space-y-6">
          <div>
  <p className="text-sm text-gray-500 mb-2">Full Name</p>

  <input
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
  />
</div>

   <div>
  <p className="text-sm text-gray-500 mb-2">Phone</p>

  <input
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
  />
</div>

<button
  type="button"
  onClick={handleSave}
  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
>
  Save Changes
</button>
</div>
</div>
</main>
);
}