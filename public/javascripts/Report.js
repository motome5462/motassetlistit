
function toggleOtherInput(checkbox, inputId) {
    const input = document.getElementById(inputId);
    if (checkbox.checked) {
        input.style.display = 'inline-block';
        input.disabled = false;
    } else {
        input.style.display = 'none';
        input.disabled = true;
        input.value = '';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const radios = document.querySelectorAll('input[type="radio"][name="status"]');

    radios.forEach(radio => {
        radio.addEventListener("click", function (e) {
            // If already checked, uncheck it manually
            if (this.checked && this.dataset.checked === "true") {
                this.checked = false;
                this.dataset.checked = "false";
                e.stopImmediatePropagation(); // prevent native behavior
            } else {
                // Reset all radios' dataset
                radios.forEach(r => r.dataset.checked = "false");
                this.dataset.checked = "true";
            }
        });
    });
});

function selectOnlyThis(checkbox, relatedInputIds) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="' + checkbox.name + '"]');
    checkboxes.forEach((cb) => {
        if (cb !== checkbox) {
            cb.checked = false;
        }
    });

    // Reset and hide all text inputs related to this group
    relatedInputIds.forEach((id) => {
        const input = document.getElementById(id);
        input.style.display = 'none';
        input.disabled = true;
        input.value = '';
    });
}

function toggleOtherInput(select) {
    const otherInput = document.getElementById("otherDevice");
    if (select.value === "other") {
        otherInput.style.display = "inline-block";
        otherInput.disabled = false;
    } else {
        otherInput.style.display = "none";
        otherInput.disabled = true;
        otherInput.value = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const selectElement = document.getElementById("device");
    toggleOtherInput(selectElement); // Initialize visibility
});
