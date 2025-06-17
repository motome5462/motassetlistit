document.addEventListener("DOMContentLoaded", () => {
  let lastChecked = null;

  const radios = document.querySelectorAll('input[name="stockLocation"]');
  radios.forEach((radio) => {
    radio.addEventListener("mousedown", function () {
      if (this.checked) {
        lastChecked = this;
      } else {
        lastChecked = null;
      }
    });

    radio.addEventListener("click", function () {
      if (lastChecked === this) {
        this.checked = false;
        lastChecked = null;
      } else {
        lastChecked = this;
      }
    });
  });
});
