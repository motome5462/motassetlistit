document.addEventListener('DOMContentLoaded', (event) => {
    const successCheckbox = document.getElementById('success');
    const failCheckbox = document.getElementById('fail');

    successCheckbox.addEventListener('change', () => {
        if (successCheckbox.checked) {
            failCheckbox.checked = false;
        }
    });

    failCheckbox.addEventListener('change', () => {
        if (failCheckbox.checked) {
            successCheckbox.checked = false;
        }
    });
});