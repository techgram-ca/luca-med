document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("priceForm");
  const button = document.getElementById("btnSubmit");
  const messageBox = document.getElementById("priceMessage");


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const from = form.from.value.trim();
    const to = form.to.value.trim();
    const email = form.email.value.trim();


    // Loading state
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const res = await fetch("/api/price-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

        // Success UI
        priceModal.classList.remove("hidden");
        priceModal.classList.add("flex");
        form.reset();

    } catch (err) {
      showMessage(
        "Something went wrong. Please try again or contact us directly.",
        "error"
      );
    } finally {
      button.disabled = false;
      button.textContent = "Get Price";
    }
  });

    function showMessage(text, type) {
        if (type === "error") {
            messageBox.textContent = text;
            messageBox.className = "text-red-600 mt-3";
        } else {
            messageBox.className = "hidden";
        }
    }

    closePriceModal.addEventListener("click", () => {
        priceModal.classList.add("hidden");
    });
    goToSignup.addEventListener("click", () => {
        priceModal.classList.add("hidden");
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    });
    
});