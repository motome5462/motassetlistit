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


const form = document.querySelector('form');

form.addEventListener('submit', function(event) {
    const successChecked = document.getElementById('success').checked;
    const failChecked = document.getElementById('fail').checked;

    if (!successChecked && !failChecked) {
        event.preventDefault(); // หยุดการส่งฟอร์ม
        alert('กรุณาเลือก Success หรือ Fail อย่างน้อยหนึ่งรายการ');
    }
});