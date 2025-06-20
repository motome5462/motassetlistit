// /public/javascripts/Report.js

// --- Filter form + Pagination logic ---

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.filter-form');
  const paginationLinks = document.querySelectorAll('.pagination a.page-link');

  // Helper: Build query string from form inputs + extra params
  function buildQuery(params = {}) {
    const formData = new FormData(form);
    for (const [key, value] of Object.entries(params)) {
      formData.set(key, value);
    }
    const query = new URLSearchParams(formData);
    return query.toString();
  }

  // On filter form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = buildQuery({ page: 1 });
    window.location.href = `/Report/getalldetail?${query}`;
  });

  // On pagination click
  paginationLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const url = new URL(link.href);
      const page = url.searchParams.get('page') || '1';

      const query = buildQuery({ page });
      window.location.href = `/Report/getalldetail?${query}`;
    });
  });
});

// Separate buildQuery function (if used elsewhere)
function buildQuery() {
  const assetid = document.getElementById('assetid').value.trim();
  const name = document.getElementById('name').value.trim();
  const dept = document.getElementById('dept').value.trim();
  const sn = document.getElementById('sn').value.trim();
  const deliveryStart = document.getElementById('deliveryStart').value;
  const deliveryEnd = document.getElementById('deliveryEnd').value;
  const repairStart = document.getElementById('repairStart').value;
  const repairEnd = document.getElementById('repairEnd').value;
  const devicetype = document.getElementById('devicetype').value;
  const UsageYears = document.getElementById('UsageYears')?.value.trim();

  const params = new URLSearchParams();
  if (dept) params.append('dept', dept);
  if (assetid) params.append('assetid', assetid);
  if (name) params.append('name', name);
  if (sn) params.append('sn', sn);
  if (UsageYears) params.append('UsageYears', UsageYears || '0');
  if (deliveryStart) params.append('deliveryStart', deliveryStart);
  if (deliveryEnd) params.append('deliveryEnd', deliveryEnd);
  if (repairStart) params.append('repairStart', repairStart);
  if (repairEnd) params.append('repairEnd', repairEnd);
  if (devicetype) params.append('devicetype', devicetype);

  return params.toString();
}

document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = buildQuery();
      window.location.href = '/Report/getalldetail?' + query + '&page=1';
    });
  }

  document.querySelectorAll('.pagination-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = this.dataset.page;
      const query = buildQuery();
      window.location.href = '/Report/getalldetail?' + query + '&page=' + page;
    });
  });
});

// --- Export Modal related code ---

// Toggle subfield groups in export modal
function toggleDeviceFields() {
  const checked = document.getElementById('device').checked;
  document.getElementById('deviceFields').style.display = checked ? 'block' : 'none';
}
function toggleCPUFields() {
  const checked = document.getElementById('cpu').checked;
  document.getElementById('cpuFields').style.display = checked ? 'block' : 'none';
}
function toggleRomdriveFields() {
  const checked = document.getElementById('romdrive').checked;
  document.getElementById('romdriveFields').style.display = checked ? 'block' : 'none';
}
function toggleMonitorFields() {
  const checked = document.getElementById('monitor').checked;
  document.getElementById('monitorFields').style.display = checked ? 'block' : 'none';
}
function toggleKeyboardFields() {
  const checked = document.getElementById('keyboard').checked;
  document.getElementById('keyboardFields').style.display = checked ? 'block' : 'none';
}
function toggleMouseFields() {
  const checked = document.getElementById('mouse').checked;
  document.getElementById('mouseFields').style.display = checked ? 'block' : 'none';
}
function togglePrinterFields() {
  const checked = document.getElementById('printer').checked;
  document.getElementById('printerFields').style.display = checked ? 'block' : 'none';
}
function toggleUPSFields() {
  const checked = document.getElementById('ups').checked;
  document.getElementById('upsFields').style.display = checked ? 'block' : 'none';
}
function toggleAdaptorFields() {
  const checked = document.getElementById('adaptor').checked;
  document.getElementById('adaptorFields').style.display = checked ? 'block' : 'none';
}
function toggleOther1Fields() {
  const checked = document.getElementById('other1').checked;
  document.getElementById('other1Fields').style.display = checked ? 'block' : 'none';
}
function toggleOSFields() {
  const checked = document.getElementById('os').checked;
  document.getElementById('osFields').style.display = checked ? 'block' : 'none';
}
function toggleOfficeFields() {
  const checked = document.getElementById('office').checked;
  document.getElementById('officeFields').style.display = checked ? 'block' : 'none';
}

// Run toggle functions on page load so modal fields are correctly shown/hidden
document.addEventListener('DOMContentLoaded', () => {
  toggleDeviceFields();
  toggleCPUFields();
  toggleRomdriveFields();
  toggleMonitorFields();
  toggleKeyboardFields();
  toggleMouseFields();
  togglePrinterFields();
  toggleUPSFields();
  toggleAdaptorFields();
  toggleOther1Fields();
  toggleOSFields();
  toggleOfficeFields();
});

// Export to Excel button handler — builds URL with filters + selected columns and opens export route
function exportToExcel() {
  const selectedCheckboxes = document.querySelectorAll('#exportColumnsForm input[type="checkbox"]:checked');
  if (selectedCheckboxes.length === 0) {
    alert('กรุณาเลือกอย่างน้อยหนึ่งคอลัมน์สำหรับการส่งออก');
    return;
  }

  const columns = Array.from(selectedCheckboxes).map(cb => cb.value);

  // Collect current filter values from your filter inputs by ID
  const params = new URLSearchParams();

  [
    'assetid', 'name', 'dept', 'sn', 'UsageYears',
    'deliveryStart', 'deliveryEnd', 'repairStart', 'repairEnd', 'devicetype'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value.trim() !== '') {
      params.append(id, el.value.trim());
    }
  });

  // Add columns param as comma separated string
  params.append('columns', columns.join(','));

  // Open export route in a new tab/window to download Excel file
  const exportUrl = '/Report/export?' + params.toString();
  window.open(exportUrl, '_blank');
}

// Toggle select all checkboxes inside export modal
function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('#exportColumnsForm input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
}
