"use client";
import { useEffect, useState } from "react";
import { useStaffProfile } from "@/lib/useStaffProfile";
import DishDetailModal from "@/components/DishDetailModal";
import DishDialog from "@/components/DishDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

export type DishRow = {
  id: string;
  name: string;
  price: number;
  categories: { name: string } | null;
  image_url: string | null;
  spice_level: number | null;
  sugar_level: number | null;
  dish_ingredients: { ingredient: string }[] | null;
  dish_allergens: { allergen: string }[] | null;
  chefs: { name: string } | null;
  calories: number | null;
  is_active: boolean;
};

export default function DishTable({ refreshKey }: { refreshKey?: number }) {
  const { isAdmin } = useStaffProfile();
  const [dishes, setDishes] = useState<DishRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishRow | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [removingDish, setRemovingDish] = useState<DishRow | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadDishes() {
      setLoading(true);
      const res = await fetch("/api/dishes");
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setDishes(data.dishes ?? []);
      setLoading(false);
    }
    loadDishes();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, internalRefresh]);

  async function handleConfirmRemove() {
    if (!removingDish) return;
    const res = await fetch(`/api/dishes/${removingDish.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setRemovingDish(null);
      return;
    }
    setRemovingDish(null);
    setInternalRefresh((k) => k + 1);
  }

  async function handleReactivate(dish: DishRow) {
    setReactivatingId(dish.id);
    const res = await fetch(`/api/dishes/${dish.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setReactivatingId(null);
      return;
    }
    setReactivatingId(null);
    setInternalRefresh((k) => k + 1);
  }

  if (loading) return <p className="text-gray-500">Loading dishes...</p>;
  if (error)
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;

  return (
    <>
      <table className="w-full overflow-hidden rounded-lg bg-white shadow sm:rounded-lg">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3" />
            <th className="px-4 py-3">Dish</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Spice / Sugar</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {dishes.map((dish) => (
            <tr
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className={`cursor-pointer border-t border-gray-100 hover:bg-gray-50 ${!dish.is_active ? "opacity-50" : ""}`}
            >
              <td className="px-4 py-3">
                {dish.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-100" />
                )}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {dish.name}
                {!dish.is_active && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {dish.categories?.name}
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                ฿{dish.price}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {!!dish.spice_level && "🌶️".repeat(dish.spice_level)}
                {!!dish.sugar_level && "🍬".repeat(dish.sugar_level)}
                {!dish.spice_level && !dish.sugar_level && "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {isAdmin ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      aria-label="Edit dish"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingDishId(dish.id);
                      }}
                      className="rounded p-1 text-blue-500 transition hover:bg-gray-100 hover:text-purple-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                        <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                      </svg>
                    </button>

                    {dish.is_active ? (
                      <button
                        type="button"
                        aria-label="Remove dish"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemovingDish(dish);
                        }}
                        className="rounded p-1 text-red-500 transition hover:bg-gray-100 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.353 5.93a.75.75 0 0 0-1.5.086l.5 8.5a.75.75 0 0 0 1.5-.086l-.5-8.5Zm4.978.086a.75.75 0 1 0-1.498-.086l-.5 8.5a.75.75 0 0 0 1.498.086l.5-8.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivate(dish);
                        }}
                        disabled={reactivatingId === dish.id}
                        className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        {reactivatingId === dish.id
                          ? "Restoring..."
                          : "Reactivate"}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">🔒 Staff only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
      {editingDishId && (
        <DishDialog
          dishId={editingDishId}
          onClose={() => setEditingDishId(null)}
          onSaved={() => setInternalRefresh((k) => k + 1)}
        />
      )}
      {removingDish && (
        <DeleteConfirmDialog
          dishName={removingDish.name}
          onClose={() => setRemovingDish(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </>
  );
}
