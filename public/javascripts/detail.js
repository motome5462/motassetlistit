function confirmDelete() {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
        document.getElementById('deleteForm').submit();
    }
}

let allSelected = false;
  
function toggleSelectAll() {
  allSelected = !allSelected;
  const checkboxes = document.querySelectorAll('#exportColumnsForm .form-check-input');
  checkboxes.forEach(checkbox => {
    checkbox.checked = allSelected;
  });
  
  // Change button text based on current state
  document.querySelector('.btn-primary').textContent = allSelected ? 'เอาออกทั้งหมด' : 'เลือกทั้งหมด';
}


function exportToExcel() {
    const form = document.getElementById('exportColumnsForm');
    const formData = new FormData(form);

    // เปลี่ยนเป็น GET request และส่ง FormData ไปยัง URL /assetlist/export?columns[]=name&columns[]=assetid เป็นต้น
    const url = '/assetlist/export?' + new URLSearchParams(formData).toString();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob(); // แปลงเป็น blob เพื่อดาวน์โหลดไฟล์ Excel
        })
        .then(blob => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'assets.xlsx'; // ชื่อไฟล์ที่จะดาวน์โหลด (สามารถแก้ไขตามที่ต้องการ)
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting to Excel:', error);
            alert('การส่งออกเป็น Excel ล้มเหลว โปรดลองอีกครั้ง');
        });
}


function toggleDeviceFields() {
    const deviceCheckbox = document.getElementById('device');
    const deviceFields = document.getElementById('deviceFields');
    const deviceTypeCheckbox = document.getElementById('devicetype');
    const deviceChoiceCheckbox = document.getElementById('devicechoice');
    const deviceModelCheckbox = document.getElementById('devicemodel');
    const deviceSNCheckbox = document.getElementById('devicesn');


    deviceFields.style.display = deviceCheckbox.checked ? 'none' : 'none';
    
    // Automatically select the related checkboxes if Device is selected
    deviceTypeCheckbox.checked = deviceCheckbox.checked;
    deviceChoiceCheckbox.checked = deviceCheckbox.checked;
    deviceModelCheckbox.checked = deviceCheckbox.checked;
    deviceSNCheckbox.checked = deviceCheckbox.checked;
  }

  function toggleCPUFields() {
    const CPUCheckbox = document.getElementById('cpu');
    const CPUFields = document.getElementById('CPUFields');
    const cpuTypeCheckbox = document.getElementById('cputype');
    const cpuAssetAccountNoCheckbox = document.getElementById('cpuassetaccountno');

    CPUFields.style.display = CPUCheckbox.checked ? 'none' : 'none';
    
    // Automatically select the related checkboxes if CPU is selected
    cpuTypeCheckbox.checked = CPUCheckbox.checked;
    cpuAssetAccountNoCheckbox.checked = CPUCheckbox.checked;
  }


  function toggleRomdriveFields() {
    const romdriveCheckbox = document.getElementById('romdrive');
    const romdriveFields = document.getElementById('romdriveFields');
    const romdriveTypeCheckbox = document.getElementById('romdrivetype');
    const romSNCheckbox = document.getElementById('romsn');
    const romAssetIDCheckbox = document.getElementById('romassetid');

    romdriveFields.style.display = romdriveCheckbox.checked ? 'none' : 'none';

    romdriveTypeCheckbox.checked = romdriveCheckbox.checked;
    romSNCheckbox.checked = romdriveCheckbox.checked;
    romAssetIDCheckbox.checked = romdriveCheckbox.checked;
  }

  function toggleMonitorFields() {
    const monitorCheckbox = document.getElementById('monitor');
    const monitorFields = document.getElementById('monitorFields');
    const monitorTypeCheckbox = document.getElementById('monitortype');
    const monitorSNCheckbox = document.getElementById('monitorsn');
    const monitorAssetidCheckbox = document.getElementById('monitorassetid');

    monitorFields.style.display = monitorCheckbox.checked ? 'none' : 'none';

    monitorTypeCheckbox.checked = monitorCheckbox.checked;
    monitorSNCheckbox.checked = monitorCheckbox.checked;
    monitorAssetidCheckbox.checked = monitorCheckbox.checked;
  }


  function toggleKeyboardFields() {
    const keyboardCheckbox = document.getElementById('keyboard');
    const keyboardFields = document.getElementById('keyboardFields');
    const keyboardTypeCheckbox = document.getElementById('keyboardtype');
    const keyboardSNCheckbox = document.getElementById('keyboardsn');
    const keyboardAssetidCheckbox = document.getElementById('keyboardassetid');

    keyboardFields.style.display = keyboardCheckbox.checked ? 'none' : 'none';
  
    keyboardTypeCheckbox.checked = keyboardCheckbox.checked;
    keyboardSNCheckbox.checked = keyboardCheckbox.checked;
    keyboardAssetidCheckbox.checked = keyboardCheckbox.checked;
}

  function toggleMouseFields() {
    const mouseCheckbox = document.getElementById('mouse');
    const mouseFields = document.getElementById('mouseFields');
    const mouseTypeCheckbox = document.getElementById('mousetype');
    const mouseSNCheckbox = document.getElementById('mousesn');
    const mouseAssetidCheckbox = document.getElementById('mouseassetid');
    
    mouseFields.style.display = mouseCheckbox.checked ? 'none' : 'none';
  
    mouseTypeCheckbox.checked = mouseCheckbox.checked;
    mouseSNCheckbox.checked = mouseCheckbox.checked;
    mouseAssetidCheckbox.checked = mouseCheckbox.checked;
}

  function togglePrinterFields() {
    const printerCheckbox = document.getElementById('printer');
    const printerFields = document.getElementById('printerFields');
    const printerModelCheckbox = document.getElementById('printermodel');
    const printerSNCheckbox = document.getElementById('printersn');
    const printerAssetidCheckbox = document.getElementById('printerassetid');

    printerFields.style.display = printerCheckbox.checked ? 'none' : 'none';
  
    printerModelCheckbox.checked = printerCheckbox.checked;
    printerSNCheckbox.checked = printerCheckbox.checked;
    printerAssetidCheckbox.checked = printerCheckbox.checked;
}

  function toggleUPSFields() {
    const upsCheckbox = document.getElementById('ups');
    const upsFields = document.getElementById('upsFields');
    const upsTypeCheckbox = document.getElementById('upstype');
    const upsVACheckbox = document.getElementById('upsva');
    const upsModelCheckbox = document.getElementById('upstypemodel');
    const upsSNCheckbox = document.getElementById('upstypesn');
    const upsAssetidCheckbox = document.getElementById('upstypeassetid');

    upsFields.style.display = upsCheckbox.checked ? 'none' : 'none';
  
    upsTypeCheckbox.checked = upsCheckbox.checked;
    upsVACheckbox.checked = upsCheckbox.checked;
    upsModelCheckbox.checked = upsCheckbox.checked;
    upsSNCheckbox.checked = upsCheckbox.checked;
    upsAssetidCheckbox.checked = upsCheckbox.checked;
}

  function toggleAdaptorFields() {
    const adaptorCheckbox = document.getElementById('adaptor');
    const adaptorFields = document.getElementById('adaptorFields');
    const adaptorSNCheckbox = document.getElementById('adaptorsn');
   
    adaptorFields.style.display = adaptorCheckbox.checked ? 'none' : 'none';
  
    adaptorSNCheckbox.checked = adaptorCheckbox.checked;
}

  function toggleOther1Fields() {
    const other1Checkbox = document.getElementById('other1');
    const other1Fields = document.getElementById('other1Fields');
    const other1SNCheckbox = document.getElementById('othersn');
    
    other1Fields.style.display = other1Checkbox.checked ? 'none' : 'none';
  
    other1SNCheckbox.checked = other1Checkbox.checked;
}

  function toggleOSFields() {
    const osCheckbox = document.getElementById('os');
    const osFields = document.getElementById('osFields');
    const osTypeCheckbox = document.getElementById('ostype');
    const osSNCheckbox = document.getElementById('ossn');

    osFields.style.display = osCheckbox.checked ? 'none' : 'none';
  
    osTypeCheckbox.checked = osCheckbox.checked;
    osSNCheckbox.checked = osCheckbox.checked;
}

  function toggleOfficeFields() {
    const officeCheckbox = document.getElementById('office');
    const officeFields = document.getElementById('officeFields');
    const officeTypeCheckbox = document.getElementById('officetype');
    const officeSNCheckbox = document.getElementById('officesn');

    officeFields.style.display = officeCheckbox.checked ? 'none' : 'none';
  
    officeTypeCheckbox.checked = officeCheckbox.checked;
    officeSNCheckbox.checked = officeCheckbox.checked;
}

  function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('#exportColumnsForm input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    checkboxes.forEach(checkbox => checkbox.checked = !allChecked);
  }