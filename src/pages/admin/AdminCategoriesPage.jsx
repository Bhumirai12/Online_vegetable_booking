import { useState } from "react";
import { categoryApi } from "../../api/categoryApi";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";

const emptyForm = { name: "", description: "" };

export default function AdminCategoriesPage() {
  const { categories, refreshCatalog } = useCatalog();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const edit = (category) => {
    setEditingId(category.categoryId);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await categoryApi.update(editingId, form);
        showToast("Category updated");
      } else {
        await categoryApi.create(form);
        showToast("Category created");
      }

      reset();
      await refreshCatalog();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await categoryApi.remove(categoryId);
      showToast("Category deleted");
      await refreshCatalog();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div className="admin-grid-two">
      <form className="table-card" onSubmit={submit}>
        <div className="section-head compact">
          <div>
            <h3>{editingId ? "Edit category" : "Add category"}</h3>
            <p>Matches CategoryRequest in your backend.</p>
          </div>
        </div>

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
          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={update}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-soft" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        <h3>Categories</h3>
        <div className="admin-list">
          {categories.map((category) => (
            <div className="admin-list-row" key={category.categoryId}>
              <div>
                <b>{category.name}</b>
                <small>{category.description || "No description"}</small>
              </div>
              <div className="row-actions">
                <button onClick={() => edit(category)}>Edit</button>
                <button
                  className="danger-link"
                  onClick={() => remove(category.categoryId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
