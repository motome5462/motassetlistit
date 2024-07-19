
function toggleOther(inputId) {
    var otherInput = document.getElementById(inputId);
    if (otherInput.style.display === "none") {
        otherInput.style.display = "block";
    } else {
        otherInput.style.display = "none";
        otherInput.value = "";  // Clear value when hiding
    }
}
document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('deviceother');
    var otherInput = document.getElementById('deviceotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "device";
    }
});document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('devicetype');
    var otherInput = document.getElementById('devicetypeinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "devicetype";
    }
});document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('devicechoice');
    var otherInput = document.getElementById('devicechoiceinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "devicechoice";
    }
});

document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('cpuother');
    var otherInput = document.getElementById('cpuotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "cpu";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('cputypeother');
    var otherInput = document.getElementById('cputypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "cputype";
    }
});

document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('speedother');
    var otherInput = document.getElementById('speedotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "speed";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('harddiskother');
    var otherInput = document.getElementById('harddiskotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "harddisk";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('ramother');
    var otherInput = document.getElementById('ramotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "ram";
    }
});

document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('romdriveother');
    var otherInput = document.getElementById('romdriveotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "romdrive";
    }
});

document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('monitorother');
    var otherInput = document.getElementById('monitorotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "monitor";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('monitortypeother');
    var otherInput = document.getElementById('monitortypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "monitortype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('keyboardtypeother');
    var otherInput = document.getElementById('keyboardtypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "keyboardtype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('mouseother');
    var otherInput = document.getElementById('mouseotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "mouse";
    }
});

document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('printerother');
    var otherInput = document.getElementById('printerotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "printer";
    }
});



document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('printertypeother');
    var otherInput = document.getElementById('printertypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "printertype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('upstypeother');
    var otherInput = document.getElementById('upstypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "upstype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('upsvaother');
    var otherInput = document.getElementById('upsvaotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "upsva";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('adaptorother');
    var otherInput = document.getElementById('adaptorotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "adaptor";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('osother');
    var otherInput = document.getElementById('osotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "os";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('ostypeother');
    var otherInput = document.getElementById('ostypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "ostype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('officeother');
    var otherInput = document.getElementById('officeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "office";
    }
});



document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('officetypeother');
    var otherInput = document.getElementById('officetypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "officetype";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('antivirusother');
    var otherInput = document.getElementById('antivirusotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "antivirus";
    }
});



document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('pdfother');
    var otherInput = document.getElementById('pdfotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "pdf";
    }
});



document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('pdftypeother');
    var otherInput = document.getElementById('pdftypeotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "pdf";
    }
});


document.querySelector('form').addEventListener('submit', function(event) {
    var otherCheckbox = document.getElementById('utilityother');
    var otherInput = document.getElementById('utilityotherinput');
    if (otherCheckbox.checked) {
        // Make sure the other checkbox value is not included
        otherCheckbox.name = "";
        otherCheckbox.value = "";

        // Set the input field to be part of the devices
        otherInput.name = "utility";
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const successCheckbox = document.getElementById('success');
    const failCheckbox = document.getElementById('fail');
    const headOfficeCheckbox = document.getElementById('companyMOT_HeadOffice');
    const rayongOfficeCheckbox = document.getElementById('companyMOT_RayongOffice');

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


    headOfficeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            rayongOfficeCheckbox.checked = false;
        }
    });

    rayongOfficeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            headOfficeCheckbox.checked = false;
        }
    });



});