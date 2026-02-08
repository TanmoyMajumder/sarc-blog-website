/* ================= ELEMENTS ================= */
const input = document.getElementById("profileImageInput");
const preview = document.getElementById("avatarPreview");
const fallback = document.getElementById("avatarFallback");

const nameInput = document.getElementById("nameInput");
const bioInput = document.getElementById("bioInput");
const deptInput = document.getElementById("deptInput");
const gradInput = document.getElementById("gradInput");

const statBlogs = document.getElementById("statBlogs");
const statBookmarks = document.getElementById("statBookmarks");

let selectedFile = null;
let currentUser = null;

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch("/api/v1/auth/me", {
      credentials: "include",
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    currentUser = data.user;

    /* PREFILL INPUTS */
    nameInput.value = currentUser.name || "";
    bioInput.value = currentUser.bio || "";
    deptInput.value = currentUser.department || "";
    gradInput.value = currentUser.graduationYear || "";

    /* AVATAR */
    if (currentUser.profileImage) {
      preview.innerHTML = `
        <img src="${currentUser.profileImage}"
             class="w-full h-full rounded-full object-cover" />
      `;
      if (fallback) fallback.style.display = "none";
    } else {
      fallback.textContent =
        currentUser.name?.charAt(0).toUpperCase() || "?";
    }

  } catch {
    showProfileToast("Failed to load profile");
  }
}

/* ================= IMAGE PREVIEW ================= */
input.addEventListener("change", () => {
  const file = input.files?.[0];
    console.log("SELECTED FILE:", file); 

  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `
      <img src="${reader.result}"
           class="w-full h-full rounded-full object-cover" />
    `;
    if (fallback) fallback.style.display = "none";
  };
  reader.readAsDataURL(file);
});

/* ================= UPLOAD IMAGE ================= */
async function uploadProfileImage() {
    console.log("UPLOAD FUNCTION CALLED");

  if (!selectedFile) {
    showProfileToast("Please select an image");
    return;
  }
  console.log("UPLOADING FILE:", selectedFile);

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const res = await fetch("/api/v1/users/profile-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    /*   backend returns clean payload */
    const { profileImage, userId } = data;

    /*  UPDATE PROFILE PAGE STATE */
    currentUser.profileImage = profileImage;

    /*  PERSIST FOR DASHBOARD + RELOAD */
    localStorage.setItem("profileImage", profileImage);

    /*  DISPATCH CLEAN EVENT */
    window.dispatchEvent(
  new CustomEvent("profileImageUpdated", {
    detail: {
      profileImage: data.user.profileImage,
      userId: data.user._id
    }
  })
);


    showProfileToast("✨ Profile image updated");

  } catch {
    showProfileToast("Image upload failed");
  }
}

/* ================= SAVE PROFILE INFO ================= */
async function saveProfileInfo() {
  const body = {
    name: nameInput.value.trim(),
    bio: bioInput.value.trim(),
    department: deptInput.value.trim(),
    graduationYear: gradInput.value,
  };

  try {
    const res = await fetch("/api/v1/users/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    /*  UPDATE LOCAL USER */
currentUser = {
  ...currentUser,
  ...data.user,
};

window.dispatchEvent(
  new CustomEvent("profileInfoUpdated", {
    detail: currentUser,
  })
);

    showProfileToast("Profile updated successfully ✨");

  } catch {
    showProfileToast("Failed to save profile");
  }
}

/* ================= LOAD STATS ================= */
async function loadProfileStats() {
  try {
    const res = await fetch("/api/v1/users/stats", {
      credentials: "include",
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    statBlogs.textContent = data.blogsWritten || 0;
    statBookmarks.textContent = data.bookmarks || 0;

  } catch {
    statBlogs.textContent = "0";
    statBookmarks.textContent = "0";
  }
}

/* ================= PUBLIC PROFILE ================= */
function openPublicProfile() {
  if (!currentUser || !currentUser._id) {
    showProfileToast("Profile not loaded");
    return;
  }

  window.open(
    `/public-profile.html?u=${currentUser._id}`,
    "_blank"
  );
}


/* ================= TOAST ================= */
function showProfileToast(message) {
  const toast = document.getElementById("profileToast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0", "translate-y-4");
  }, 2500);
}

/* ================= INIT ================= */
loadProfile();
loadProfileStats();
async function handleSaveProfile() {
  console.log("HANDLE SAVE PROFILE CLICKED");

  if (selectedFile) {
    await uploadProfileImage();
  }

  await saveProfileInfo();
}
window.handleSaveProfile = handleSaveProfile;

/* ================= EXPOSE ================= */
window.uploadProfileImage = uploadProfileImage;
window.saveProfileInfo = saveProfileInfo;
window.openPublicProfile = openPublicProfile;  