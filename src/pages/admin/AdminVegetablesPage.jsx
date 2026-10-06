import { useMemo, useState } from "react";
import { vegetableApi } from "../../api/vegetableApi";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatters";
import { getVegetableImage } from "../../utils/images";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  unit: "",
  categoryId: "",
  imageUrl: "",
};

export default function AdminVegetablesPage() {
  const { vegetables, categories, refreshCatalog } = useCatalog();
  const { showToast } = useToast();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.name,
          category.categoryId,
        ])
      ),
    [categories]
  );

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const edit = (vegetable) => {
    setEditingId(vegetable.vegetableId);
    setImageFile(null);

    setForm({
      name: vegetable.name || "",
      description: vegetable.description || "",
      price: vegetable.price ?? "",
      stock: vegetable.stock ?? "",
      unit: vegetable.unit || "",
      categoryId: categoryMap.get(vegetable.category) || "",
      imageUrl:
        vegetable.imageUrl ||
        vegetable.imageURL ||
        "",
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      // Keep old image when editing.
      // If admin selects a new image, upload it first.
      let imageUrl = form.imageUrl;

      if (imageFile) {
        const uploadResponse =
          await vegetableApi.uploadImage(imageFile);

        imageUrl = uploadResponse.imageUrl;
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        unit: form.unit,
        categoryId: Number(form.categoryId),
        imageUrl: imageUrl,
      };

      if (editingId) {
        await vegetableApi.update(
          editingId,
          payload
        );

        showToast("Vegetable updated");
      } else {
        await vegetableApi.create(payload);

        showToast("Vegetable added");
      }

      reset();
      await refreshCatalog();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (vegetableId) => {
    if (!window.confirm("Delete this vegetable?")) {
      return;
    }

    try {
      await vegetableApi.remove(vegetableId);

      showToast("Vegetable deleted");

      await refreshCatalog();
    } catch (error) {
      showToast(error.message, "error");
    }
  };


  return (
    <>
      <form
        className="table-card admin-form"
        onSubmit={submit}
      >
        <div className="section-head compact">
          <div>
            <h3>
              {editingId
                ? "Edit vegetable"
                : "Add vegetable"}
            </h3>

            <p>
              Add vegetable details and upload
              an image.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="field">
            <label>Name</label>

            <input
              name="name"
              required
              value={form.name}
              onChange={update}
            />
          </div>

          <div className="field">
            <label>Category</label>

            <select
              name="categoryId"
              required
              value={form.categoryId}
              onChange={update}
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  value={category.categoryId}
                  key={category.categoryId}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Price</label>

            <input
              name="price"
              type="number"
              min="1"
              step="0.01"
              required
              value={form.price}
              onChange={update}
            />
          </div>

          <div className="field">
            <label>Stock</label>

            <input
              name="stock"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={update}
            />
          </div>

          <div className="field">
            <label>Unit</label>

            <input
              type="text"
              name="unit"
              value={form.unit}
              onChange={update}
              placeholder="e.g. 1 kg, 500 g, 1 bunch"
              required
            />
          </div>

          <div className="field admin-span-two">
            <label>Vegetable Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(
                  event.target.files[0] || null
                )
              }
            />

            {editingId && form.imageUrl && (
              <small>
                Current image: {form.imageUrl}
              </small>
            )}
          </div>

          <div className="field admin-span-two">
            <label>Description</label>

            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={update}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Vegetable"
              : "Add Vegetable"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-soft"
              onClick={reset}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-card admin-table-spacing">
        <h3>Vegetables</h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vegetable</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vegetables.map((vegetable) => (
                <tr key={vegetable.vegetableId}>
                  <td>
                    <div className="table-product">
                      <img
                        src={getVegetableImage(
                          vegetable
                        )}
                        alt={vegetable.name}
                      />

                      <div>
                        <b>{vegetable.name}</b>

                        <small>
                          {vegetable.description}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{vegetable.category}</td>

                  <td>
                    {formatCurrency(
                      vegetable.price
                    )}
                  </td>

                  <td>
                    {vegetable.unit || "-"}
                  </td>

                  <td>
                    {vegetable.stock}
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        onClick={() =>
                          edit(vegetable)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger-link"
                        onClick={() =>
                          remove(
                            vegetable.vegetableId
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}