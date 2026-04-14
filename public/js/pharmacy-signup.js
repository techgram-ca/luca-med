document.addEventListener("DOMContentLoaded", () => {
    const messageBox = document.getElementById("signupMessage");
  document
    .getElementById("pharmacyForm")
    .addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const payload = {
    pharmacy_name: form.pharmacy_name.value.trim(),
    contact_name: form.contact_name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    message: form.message.value.trim(),
    services:Array.from(
                    form.querySelectorAll('input[name="services[]"]:checked')
                    ).map(cb => cb.value)
  };

  try{
  const res = await fetch("/api/pharmacy-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

  if (res.ok) {
    form.reset();
    // Success UI
      showMessage(
        "Thank you for signing up! Our team will contact you shortly.",
        "success"
      );
  }
 } catch(err) {
    showMessage(
        "Something went wrong. Please try again or contact us directly.",
        "error"
      );
  }
});
  function showMessage(text, type) {
        if (type === "error") {
            messageBox.className = "text-red-600 mt-3";
        } else {
            messageBox.className = "text-green-600 mt-3";
        }
        messageBox.textContent = text;
    }
});

