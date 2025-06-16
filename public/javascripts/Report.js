// /public/javascripts/Report.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.filter-form');
  const paginationLinks = document.querySelectorAll('.pagination a.page-link');

  // Helper: Build query string from form inputs
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
    // Always reset to page 1 on filter submit
    const query = buildQuery({ page: 1 });
    window.location.href = `/Report/getalldetail?${query}`;
  });

  // On pagination click
  paginationLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      // Get the target page from the href URL
      const url = new URL(link.href);
      const page = url.searchParams.get('page') || '1';

      // Build query with page and current filters from the form
      const query = buildQuery({ page });
      window.location.href = `/Report/getalldetail?${query}`;
    });
  });
});

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
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = buildQuery();
      window.location.href = '/Report/getalldetail?' + query + '&page=1';
    });
  }

  document.querySelectorAll('.pagination-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.dataset.page;
      const query = buildQuery();
      window.location.href = '/Report/getalldetail?' + query + '&page=' + page;
    });
  });
});
