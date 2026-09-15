"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");

  const [packageServiceId, setPackageServiceId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [revisions, setRevisions] = useState("");
  const [features, setFeatures] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
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

      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      const { data: packageData } = await supabase
        .from("packages")
        .select("*")
        .order("created_at", { ascending: true });

      setServices(serviceData || []);
      setCategories(categoryData || []);
      setPackages(packageData || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const clearServiceForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setEditingId(null);
    setImageFile(null);
setImagePreview("");
  };
const uploadServiceImage = async () => {
  if (!imageFile) return null;

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("service-images")
    .upload(fileName, imageFile);

  if (error) {
    alert(error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("service-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
  const saveService = async () => {
    const imageUrl = await uploadServiceImage();
    if (!title.trim() || !categoryId || !price) {
      alert("Please fill in Title, Category and Price.");
      return;
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    if (editingId) {
      const { data, error } = await supabase
        .from("services")
        .update({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category_id: categoryId,
          slug,
          image_url: imageUrl,
        })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === editingId ? data : item
        )
      );

      alert("Service updated successfully!");
      clearServiceForm();
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category_id: categoryId,
        slug,
        image_url: imageUrl,
        is_active: true,
        featured: false,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setServices((current) => [data, ...current]);

    alert("Service added successfully!");
    clearServiceForm();
  };

  const editService = (service: any) => {
    setEditingId(service.id);
    setTitle(service.title || "");
    setDescription(service.description || "");
    setPrice(String(service.price || ""));
    setCategoryId(service.category_id || "");
    setImagePreview(service.image_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteService = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      alert(
        "Cannot delete this service. It may have packages connected to it."
      );
      return;
    }

    setServices((current) =>
      current.filter((item) => item.id !== id)
    );

    alert("Service deleted successfully!");
  };

  const toggleActive = async (service: any) => {
    const newStatus = !service.is_active;

    const { error } = await supabase
      .from("services")
      .update({
        is_active: newStatus,
      })
      .eq("id", service.id);

    if (error) {
      alert(error.message);
      return;
    }

    setServices((current) =>
      current.map((item) =>
        item.id === service.id
          ? { ...item, is_active: newStatus }
          : item
      )
    );
  };

  const clearPackageForm = () => {
    setPackageServiceId("");
    setPackageName("");
    setPackageDescription("");
    setPackagePrice("");
    setDeliveryDays("");
    setRevisions("");
    setFeatures("");
    setIsPopular(false);
    setEditingPackageId(null);
  };

  const savePackage = async () => {
    if (
      !packageServiceId ||
      !packageName.trim() ||
      !packagePrice ||
      !deliveryDays ||
      !revisions
    ) {
      alert(
        "Please fill Service, Package Name, Price, Delivery Days and Revisions."
      );
      return;
    }

    const packageData = {
      service_id: packageServiceId,
      name: packageName.trim(),
      description: packageDescription.trim(),
      price: Number(packagePrice),
      delivery_days: Number(deliveryDays),
      revisions: Number(revisions),
      features: features.trim(),
      is_popular: isPopular,
    };

    if (editingPackageId) {
      const { data, error } = await supabase
        .from("packages")
        .update(packageData)
        .eq("id", editingPackageId)
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setPackages((current) =>
        current.map((item) =>
          item.id === editingPackageId ? data : item
        )
      );

      alert("Package updated successfully!");
      clearPackageForm();
      return;
    }

    const { data, error } = await supabase
      .from("packages")
      .insert(packageData)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((current) => [...current, data]);

    alert("Package added successfully!");
    clearPackageForm();
  };

  const editPackage = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPackageServiceId(pkg.service_id || "");
    setPackageName(pkg.name || "");
    setPackageDescription(pkg.description || "");
    setPackagePrice(String(pkg.price || ""));
    setDeliveryDays(String(pkg.delivery_days || ""));
    setRevisions(String(pkg.revisions || ""));
    setFeatures(pkg.features || "");
    setIsPopular(Boolean(pkg.is_popular));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePackage = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this package?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((current) =>
      current.filter((item) => item.id !== id)
    );

    alert("Package deleted successfully!");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold">
          Manage Services
        </h1>

        <p className="text-gray-500 mt-2">
          Manage services and packages.
        </p>

        {/* SERVICE FORM */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold">
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Service Title"
              className="border rounded-lg px-4 py-3"
            />

            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Starting Price"
              type="number"
              className="border rounded-lg px-4 py-3"
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short Description"
              className="border rounded-lg px-4 py-3"
            /><div className="md:col-span-2">
  <label className="mb-2 block text-sm font-medium">
    Service Image
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setImageFile(file);

      if (file) {
        setImagePreview(URL.createObjectURL(file));
      }
    }}
    className="w-full rounded-lg border p-2"
  />

  {imagePreview && (
    <img
      src={imagePreview}
      alt="Service Preview"
      className="mt-3 h-32 w-48 rounded-lg object-cover"
    />
  )}
</div>

          </div>

          <div className="flex gap-3 mt-5">

            <button
              onClick={saveService}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              {editingId ? "Update Service" : "Add Service"}
            </button>

            {editingId && (
              <button
                onClick={clearServiceForm}
                className="border px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </div>

        {/* PACKAGE FORM */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold">
            {editingPackageId
              ? "Edit Package"
              : "Add New Package"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

            <select
              value={packageServiceId}
              onChange={(e) =>
                setPackageServiceId(e.target.value)
              }
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                Select Service
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.title}
                </option>
              ))}
            </select>

            <input
              value={packageName}
              onChange={(e) =>
                setPackageName(e.target.value)
              }
              placeholder="Package Name (Basic / Standard / Premium)"
              className="border rounded-lg px-4 py-3"
            />

            <input
              value={packagePrice}
              onChange={(e) =>
                setPackagePrice(e.target.value)
              }
              placeholder="Package Price"
              type="number"
              className="border rounded-lg px-4 py-3"
            />

            <input
              value={deliveryDays}
              onChange={(e) =>
                setDeliveryDays(e.target.value)
              }
              placeholder="Delivery Days"
              type="number"
              className="border rounded-lg px-4 py-3"
            />

            <input
              value={revisions}
              onChange={(e) =>
                setRevisions(e.target.value)
              }
              placeholder="Number of Revisions"
              type="number"
              className="border rounded-lg px-4 py-3"
            />

            <input
              value={packageDescription}
              onChange={(e) =>
                setPackageDescription(e.target.value)
              }
              placeholder="Package Description"
              className="border rounded-lg px-4 py-3"
            />

            <textarea
              value={features}
              onChange={(e) =>
                setFeatures(e.target.value)
              }
              placeholder="Features (e.g. Logo, Banner, Social Media Design)"
              className="border rounded-lg px-4 py-3 md:col-span-2"
              rows={3}
            />

          </div>

        <label className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    checked={isPopular}
    onChange={(e) =>
      setIsPopular(e.target.checked)
    }
  />

  <span>
    Mark as Popular Package
  </span>
</label>

          <div className="flex gap-3 mt-5">

            <button
              onClick={savePackage}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              {editingPackageId
                ? "Update Package"
                : "Add Package"}
            </button>

            {editingPackageId && (
              <button
                onClick={clearPackageForm}
                className="border px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </div>

        {/* SERVICES */}

        <div className="mt-8 space-y-4">

          {services.map((service) => {

            const servicePackages = packages.filter(
              (pkg) => pkg.service_id === service.id
            );

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold">
                      {service.title}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {service.description}
                    </p>

                    <p className="font-semibold mt-2">
                      Starting Price: ৳{service.price}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Status:{" "}
                      {service.is_active
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    <button
                      onClick={() =>
                        editService(service)
                      }
                      className="border px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleActive(service)
                      }
                      className={`px-4 py-2 rounded-lg text-white ${
                        service.is_active
                          ? "bg-gray-600"
                          : "bg-green-600"
                      }`}
                    >
                      {service.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        deleteService(service.id)
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>

                  </div>

                </div>

                {/* PACKAGES */}

                <div className="mt-6 border-t pt-5">

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">
                      Packages
                    </h3>

                    <span className="text-sm text-gray-500">
                      {servicePackages.length} package
                      {servicePackages.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  {servicePackages.length === 0 ? (
                    <p className="text-gray-400 mt-4">
                      No packages added yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                      {servicePackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="border rounded-xl p-5"
                        >

                          {pkg.is_popular && (
                            <span className="inline-block bg-black text-white text-xs px-3 py-1 rounded-full mb-3">
                              Popular
                            </span>
                          )}

                          <h4 className="font-bold text-lg">
                            {pkg.name}
                          </h4>

                          <p className="text-2xl font-bold mt-2">
                            ৳{pkg.price}
                          </p>

                          <p className="text-sm text-gray-500 mt-2">
                            Delivery: {pkg.delivery_days} days
                          </p>

                          <p className="text-sm text-gray-500">
                            Revisions: {pkg.revisions}
                          </p>

                          {pkg.description && (
                            <p className="text-sm text-gray-600 mt-3">
                              {pkg.description}
                            </p>
                          )}

                          {pkg.features && (
                            <p className="text-sm text-gray-600 mt-2">
                              Features: {pkg.features}
                            </p>
                          )}

                          <div className="flex gap-2 mt-4">

                            <button
                              onClick={() =>
                                editPackage(pkg)
                              }
                              className="border px-3 py-2 rounded-lg text-sm"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deletePackage(pkg.id)
                              }
                              className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </main>
  );
}