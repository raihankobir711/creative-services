"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      setCategories(data || []);
      setLoading(false);
    };

    loadCategories();
  }, [router]);

  const saveCategory = async () => {
    if (!name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    if (editingId) {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
        })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === editingId ? data : item
        )
      );

      alert("Category updated successfully!");
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: name.trim(),
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setCategories((current) => [...current, data]);

      alert("Category added successfully!");
    }

    setName("");
    setEditingId(null);
  };

  const editCategory = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCategory = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "Cannot delete this category. It may have services connected to it."
      );
      return;
    }

    setCategories((current) =>
      current.filter((item) => item.id !== id)
    );

    alert("Category deleted successfully!");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading categories...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold">
          Manage Categories
        </h1>

        <p className="text-gray-500 mt-2">
          Add, edit and manage service categories.
        </p>

        {/* Form */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>

          <div className="flex flex-col md:flex-row gap-3 mt-5">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category Name"
              className="flex-1 border rounded-lg px-4 py-3"
            />

            <button
              onClick={saveCategory}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              {editingId ? "Update" : "Add Category"}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setName("");
                }}
                className="border px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>
        </div>

        {/* Category List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >

              <h2 className="text-lg font-semibold">
                {category.name}
              </h2>

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() => editCategory(category)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCategory(category.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </main>
  );
}