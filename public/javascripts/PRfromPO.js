// public/javascripts/PRfromPO.js

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('mousedown', function () {
      this.wasChecked = this.checked;
    });

    radio.addEventListener('click', function (e) {
      if (this.wasChecked) {
        this.checked = false;
        this.wasChecked = false;
        e.preventDefault();
      }
    });
  });
});
