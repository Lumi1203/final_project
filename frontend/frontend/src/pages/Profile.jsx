import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { fetchMe } = useAuth();

  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);

  const [detailsForm, setDetailsForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    institution: "",
    address: "",
  });

  const [photoFile, setPhotoFile] = useState(null);

  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  function setMessage(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 5000);
  }

  async function load() {
    const meRes = await api.get("/auth/me/");
    const profRes = await api.get("/auth/profile/");
    setMe(meRes.data);
    setProfile(profRes.data);

    setDetailsForm({
      first_name: meRes.data.first_name || "",
      last_name: meRes.data.last_name || "",
      phone: meRes.data.phone || "",
      institution: meRes.data.institution || "",
      address: meRes.data.address || "",
    });
  }

  useEffect(() => {
    load();
  }, []);

  function setDetails(k, v) {
    setDetailsForm((p) => ({ ...p, [k]: v }));
  }

  async function saveDetails(e) {
    e.preventDefault();
    try {
      await api.patch("/auth/me/update/", detailsForm);
      await load();
      await fetchMe();
      setMessage("success", "Profile details updated.");
    } catch (err) {
      setMessage("danger", JSON.stringify(err?.response?.data || "Update failed"));
    }
  }

  async function uploadPhoto(e) {
    e.preventDefault();
    if (!photoFile) return setMessage("danger", "Please choose a photo first.");

    try {
      const fd = new FormData();
      fd.append("photo", photoFile);

      const res = await api.post("/auth/profile/photo/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data);
      setPhotoFile(null);
      setMessage("success", "Profile photo updated.");
    } catch (err) {
      setMessage("danger", JSON.stringify(err?.response?.data || "Upload failed"));
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await api.post("/auth/password/change/", pwForm);
      setPwForm({ old_password: "", new_password: "" });
      setMessage("success", "Password changed. Please login again if prompted.");
    } catch (err) {
      setMessage("danger", JSON.stringify(err?.response?.data || "Password change failed"));
    }
  }

  return (
    <div className="container my-4" style={{ maxWidth: 900 }}>
      <h2 className="mb-3">Manage Profile</h2>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="row g-3">
        {/* Left: Photo */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <img
                src={profile?.photo_url}
                alt="profile"
                className="rounded-circle mb-3"
                style={{ width: 140, height: 140, objectFit: "cover" }}
              />
              <div className="mb-2">
                <div className="small text-muted">@{me?.username}</div>
                <div className="badge bg-secondary mt-1">{me?.role}</div>
              </div>

              <form onSubmit={uploadPhoto}>
                <input
                  className="form-control form-control-sm mb-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
                <button className="btn btn-outline-primary btn-sm w-100" type="submit">
                  Upload Photo
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Details + password */}
        <div className="col-md-8">
          {/* Details */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Personal Details</h5>

              <form onSubmit={saveDetails}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First name</label>
                    <input
                      className="form-control"
                      value={detailsForm.first_name}
                      onChange={(e) => setDetails("first_name", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last name</label>
                    <input
                      className="form-control"
                      value={detailsForm.last_name}
                      onChange={(e) => setDetails("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    value={detailsForm.phone}
                    onChange={(e) => setDetails("phone", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Institution</label>
                  <input
                    className="form-control"
                    value={detailsForm.institution}
                    onChange={(e) => setDetails("institution", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={detailsForm.address}
                    onChange={(e) => setDetails("address", e.target.value)}
                  />
                </div>

                <button className="btn btn-success" type="submit">
                  Save Details
                </button>
              </form>
            </div>
          </div>

          {/* Change password */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Change Password</h5>

              <form onSubmit={changePassword}>
                <div className="mb-3">
                  <label className="form-label">Old password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwForm.old_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, old_password: e.target.value }))}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                  />
                </div>

                <button className="btn btn-outline-danger" type="submit">
                  Change Password
                </button>

                <div className="small text-muted mt-2">
                  If your session stops working after changing password, just login again.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
