var express = require('express');
var router = express.Router();
const { default: mongoose } = require("mongoose");
const assetlistModel = require("../models/assetlist");
const repairModel = require("../models/repair");
const upload = require('../config/multerConfig');
const ExcelJS = require('exceljs');
const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

router.post("/inputassetlist", upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async function (req, res, next) {
    try {
        const {    
            name,
            assetitlistsdate,
            assetid,
            assetitlistscompany,
            computername,
            device,
            devicetype,
            devicechoice,
            devicemodel,
            devicesn,
            cpu,
            cputype,
            cpuassetaccountno,
            speed,
            harddisk,
            ram,
            romdrive,
            romdrivetype,
            romsn,
            romassetid,
            monitor,
            monitortype,
            monitorsn,
            monitorassetid,
            keyboard,
            keyboardtype,
            keyboardsn,
            keyboardassetid,
            mouse,
            mousetype,
            mousesn,
            mouseassetid,
            printer,
            printertype,
            printermodel,
            printersn,
            printerassetid,
            ups,
            upstype,
            upsva,
            upstypemodel,
            upstypesn,
            upstypeassetid,
            adaptor,
            adaptorsn,
            other1,
            othersn,
            os,
            ostype,
            ossn,
            office,
            officetype,
            officesn,
            antivirus,
            pdf,
            utility, 
            other2,
            mapdrive,
            addprinter,
            other3,
            assetitlistsremark,
            dept,
            deliverydate,
            detailrepair,
            repairdate,
            value,
            success,
            fail,
            repairremark,

        } = req.body;

        if (!name) {
            return res.status(400).send(`<script>alert('กรุณากรอกชื่อ'); window.location.href='/assetlist';</script>`);
        }

        if (!assetid) {
            return res.status(400).send(`<script>alert('กรุณากรอก Asset ID'); window.location.href='/assetlist';</script>`);
        }

        if (!devicesn) {
            return res.status(400).send(`<script>alert('กรุณากรอก S/N'); window.location.href='/assetlist';</script>`);
        }

        // const nameExists = await assetlistModel.exists({ name });
        // if (nameExists) {
        //     return res.status(400).send(`<script>alert('ชื่อซ้ำกับในฐานข้อมูล'); window.location.href='/assetlist/getalldetail';</script>`);
        // } 

        let img = "";
        if (req.files.img) {
            img = req.files.img[0].filename;  // เก็บชื่อไฟล์รูปภาพ
        }else if (req.body.existingImage) {
            img = req.body.existingImage;  // ใช้รูปภาพที่มีอยู่ในฐานข้อมูล
        }

        // let pdf = "";
        // if (req.files.pdf) {
        //     pdf = req.files.pdf[0].filename;  // เก็บชื่อไฟล์ PDF
        // }

        // let pdf = "";
        // if (req.files.pdfs) {
        //     pdf = req.file.filename  // เก็บชื่อไฟล์ PDF ทั้งหมดใน array
        // }


        let newassetlist = new assetlistModel({
            name: name || "",  // ใช้ค่าเริ่มต้นเป็นค่าว่างหากไม่ได้ระบุ
            assetitlistsdate: assetitlistsdate || null,  // ใช้ค่าเริ่มต้นเป็น null หากไม่ได้ระบุ
            assetid: assetid || "", // ใช้ค่าเริ่มต้นเป็นค่าว่างหากไม่ได้ระบุ
            img: img || "", // ใช้ค่าเริ่มต้นเป็นค่าว่างหากไม่ได้ระบุ
            assetitlistscompany: assetitlistscompany || "",
            computername: computername || "",
            device: device || "",
            devicetype: devicetype || "",
            devicechoice: devicechoice || "", 
            devicemodel: devicemodel || "",
            devicesn: devicesn || "",
            cpu: cpu || "",
            cputype: cputype || "",
            cpuassetaccountno: cpuassetaccountno || "",
            speed: speed || "",
            harddisk: harddisk || "",
            ram: ram || "",
            romdrive: romdrive || "",
            romdrivetype:romdrivetype || "",
            romsn: romsn || "",
            romassetid: romassetid || "",
            monitor: monitor || "",
            monitortype: monitortype || "",
            monitorsn: monitorsn || "",
            monitorassetid: monitorassetid || "",
            keyboard: keyboard || "",
            keyboardtype: keyboardtype || "",
            keyboardsn: keyboardsn || "",
            keyboardassetid: keyboardassetid || "",
            mouse: mouse || "",
            mousetype: mousetype || "",
            mousesn:mousesn || "",
            mouseassetid:mouseassetid || "",
            printer: printer || "",
            printertype: printertype || "",
            printermodel: printermodel || "",
            printersn: printersn || "",
            printerassetid: printerassetid || "",
            ups: ups || "",
            upstype: upstype || "",
            upsva: upsva || "",
            upstypemodel: upstypemodel || "",
            upstypesn: upstypesn || "",
            upstypeassetid: upstypeassetid || "",
            adaptor: adaptor || "",
            adaptorsn: adaptorsn || "",
            other1: other1 || "",
            othersn: othersn || "",
            os: os || "",
            ostype: ostype || "",
            ossn: ossn || "",
            office: office || "",
            officetype: officetype || "",
            officesn: officesn || "",
            antivirus: antivirus || "",
            pdf: pdf || "",
            utility: utility || "",
            other2: other2 || "",
            mapdrive: mapdrive || "",
            addprinter: addprinter || "",
            other3: other3 || "",
            assetitlistsremark: assetitlistsremark || "", 
            dept: dept || "",
            deliverydate:deliverydate || "",
        });

        let assetlist = await newassetlist.save();
        


        const newRepair = new repairModel({
            detailrepair: detailrepair || "ไม่มีการซ่อม",
            value: value || "",
            success: success || "",
            fail: fail || "",
            repairremark: repairremark || "",
            repairdate: repairdate || new Date(),
            total: "",  // Calculate total if needed
            computername: assetlist._id,   // Reference to the saved assetlist
        });

        const savedRepair = await newRepair.save();

        // Update assetlist to include this repair
        assetlist.repairs.push(savedRepair._id);
        await assetlist.save();

        // await newRepair.save();
        


       res.redirect(`/Report/getalldetail`);

    } catch (error) {
        console.error("Error creating entry:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});


router.get('/getalldetail', async (req, res) => {
  try {
    const {
      assetid,
      name,
      dept,
      UsageYears,
      deliveryStart,
      deliveryEnd,
      repairStart,
      repairEnd,
      devicetype,
      sn,
      page = 1,
      limit = 2
    } = req.query;

    const filters = {};

    if (assetid) {
      filters.assetid = { $regex: `^${assetid}$`, $options: 'i' };
    }
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    if (dept) {
      filters.dept = { $regex: dept, $options: 'i' };
    }

    const now = new Date();
    const totalMonths = (parseInt(UsageYears) || 0) * 12;

    if (totalMonths) {
      filters.deliverydate = filters.deliverydate || {};
    }

  // Example: at least 24 months used means delivery date <= (today - 24 months)
      if (totalMonths) {
        const maxDeliveryDate = new Date(now);
        maxDeliveryDate.setMonth(maxDeliveryDate.getMonth() - totalMonths);
        filters.deliverydate.$lte = maxDeliveryDate;
      } 

    if (deliveryStart || deliveryEnd) {
      filters.deliverydate = {};
      if (deliveryStart) filters.deliverydate.$gte = new Date(deliveryStart);
      if (deliveryEnd) filters.deliverydate.$lte = new Date(deliveryEnd);
    }

    if (devicetype && devicetype !== '') {
      if (devicetype === 'Other') {
        const mainTypes = ['Laptop', 'PC', 'Server', 'Switch', 'Router'];
        filters.devicetype = { $nin: mainTypes };
      } else {
        filters.devicetype = devicetype;
      }
    }

    // 🔍 Add S/N search (for multiple serial number fields)
    if (sn) {
      const regex = new RegExp(sn, 'i');
      filters.$or = [
        { devicesn: regex },
        { romsn: regex },
        { monitorsn: regex },
        { keyboardsn: regex },
        { mousesn: regex },
        { printersn: regex },
        { upstypesn: regex },
        { adaptorsn: regex },
        { othersn: regex },
        { ossn: regex },
        { officesn: regex }
      ];
    }

    let query = assetlistModel.find(filters);

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    query = query.skip((pageNumber - 1) * pageLimit).limit(pageLimit);

    const assetlist = await query.populate({
      path: 'repairs',
      match: (() => {
        const repairDateFilter = {};
        if (repairStart) repairDateFilter.$gte = new Date(repairStart);
        if (repairEnd) repairDateFilter.$lte = new Date(repairEnd);
        if (repairStart || repairEnd) {
          return { repairdate: repairDateFilter };
        }
        return {};
      })()
    }).lean();

    for (const item of assetlist) {
      item.totalValue = (item.repairs || []).reduce((sum, r) => sum + parseFloat(r.value || 0), 0);

      if (item.img) {
        item.img = path.basename(item.img);
      }

      if (item.deliverydate) {
        const now = new Date();
        const deliveryDate = new Date(item.deliverydate);

        let years = now.getFullYear() - deliveryDate.getFullYear();
        let months = now.getMonth() - deliveryDate.getMonth();

        if (months < 0) {
          years -= 1;
          months += 12;
        }

        item.ageFormatted = `${years} year(s) ${months} month(s)`;
      } else {
        item.ageFormatted = 'N/A';
      }
    }
    
  const count = await assetlistModel.countDocuments(filters);

  res.render('Report', {
    data: assetlist,
    totalPages: Math.ceil(count / pageLimit),
    currentPage: pageNumber,
    assetid,
    name,
    dept,
    deliveryStart,
    deliveryEnd,
    repairStart,
    repairEnd,
    devicetype,
    sn,
    UsageYears,
    limit: pageLimit
  });


    assetlist.forEach(item => {
      item.img = null;
    });

  } catch (error) {
    console.error('Error fetching filtered assetlist:', error);
    res.status(500).send({ message: 'Server error', success: false });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "ID Invalid",
        success: false,
        error: ["ID is not a ObjectId"],
      });
    }

    const assetlist = await assetlistModel.findById(id).lean();

    if (!assetlist) {
      return res.status(404).send({
        message: "Data not found",
        success: false,
      });
    }

    if (assetlist.img) {
      const imgPath = path.join(__dirname, '../public/images', assetlist.img);
      if (fs.existsSync(imgPath)) {
        assetlist.img = path.basename(assetlist.img);
      } else {
        assetlist.img = null;
      }
    }

    res.render('Report', { data: [assetlist] });

  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).send({
      message: "Server error",
      success: false,
    });
  }
});




router.get('/export', async (req, res) => {
  try {
    const {
      assetid,
      name,
      dept,
      UsageYears,
      deliveryStart,
      deliveryEnd,
      repairStart,
      repairEnd,
      devicetype,
      sn,
      columns
    } = req.query;

    if (!columns) {
      return res.status(400).send('Missing columns parameter');
    }

    // Parse columns string into array
    const selectedColumns = decodeURIComponent(columns)
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(col => col.trim())
      .filter(Boolean);

    if (!selectedColumns.length) {
      return res.status(400).send('No columns selected for export');
    }

    // Build asset filters
    const filters = {};
    if (assetid) filters.assetid = { $regex: assetid, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };
    if (dept) filters.dept = { $regex: dept, $options: 'i' };

    if (UsageYears) {
      const months = parseInt(UsageYears) * 12;
      if (!filters.deliverydate) filters.deliverydate = {};
      const dateLimit = new Date();
      dateLimit.setMonth(dateLimit.getMonth() - months);
      filters.deliverydate.$lte = dateLimit;
    }

    if (deliveryStart || deliveryEnd) {
      if (!filters.deliverydate) filters.deliverydate = {};
      if (deliveryStart) filters.deliverydate.$gte = new Date(deliveryStart);
      if (deliveryEnd) filters.deliverydate.$lte = new Date(deliveryEnd);
    }

    if (devicetype) {
      if (devicetype === 'Other') {
        filters.devicetype = { $nin: ['Laptop', 'PC', 'Server', 'Switch', 'Router'] };
      } else {
        filters.devicetype = devicetype;
      }
    }

    if (sn) {
      const regex = new RegExp(sn, 'i');
      filters.$or = [
        { devicesn: regex },
        { romsn: regex },
        { monitorsn: regex },
        { keyboardsn: regex },
        { mousesn: regex },
        { printersn: regex },
        { upstypesn: regex },
        { adaptorsn: regex },
        { othersn: regex },
        { ossn: regex },
        { officesn: regex }
      ];
    }

    // Fetch assets
    const assets = await assetlistModel.find(filters).lean();

    // Collect asset IDs for repair filtering
    const assetIds = assets.map(a => a._id);

    // Build repair filters
    const repairFilters = { computername: { $in: assetIds } };
    if (repairStart || repairEnd) {
      repairFilters.repairdate = {};
      if (repairStart) repairFilters.repairdate.$gte = new Date(repairStart);
      if (repairEnd) repairFilters.repairdate.$lte = new Date(repairEnd);
    }

    // Fetch repairs
    const repairs = await repairModel.find(repairFilters).lean();

    // Build Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    // Setup columns for Excel
    worksheet.columns = selectedColumns.map(col => ({
      header: col.charAt(0).toUpperCase() + col.slice(1),
      key: col,
      width: 20
    }));

    // Helper to format cell values (arrays join, else string)
    const formatValue = val => {
      if (Array.isArray(val)) return val.join(', ');
      if (val == null) return '';
      return val;
    };

    // Add asset rows
    for (const asset of assets) {
      const rowData = {};
      for (const col of selectedColumns) {
        if (col === 'img') continue; // handle images later
        rowData[col] = formatValue(asset[col]);
      }
      const row = worksheet.addRow(rowData);

      // Add image if 'img' column selected and asset has image
      if (selectedColumns.includes('img') && asset.img) {
        const imgPath = path.join(__dirname, '../public/images', asset.img);
        if (fs.existsSync(imgPath)) {
          const imgId = workbook.addImage({
            filename: imgPath,
            extension: path.extname(imgPath).slice(1)
          });
          worksheet.addImage(imgId, {
            tl: { col: selectedColumns.indexOf('img'), row: row.number - 1 },
            ext: { width: 100, height: 100 }
          });
          row.height = 75;
        }
      }

      // Add repairs rows linked to this asset
      const assetRepairs = repairs.filter(r => r.computername?.toString() === asset._id.toString());
      for (const repair of assetRepairs) {
        const repairRow = {};
        for (const col of selectedColumns) {
          // Repairs don't have asset columns, so empty string for asset fields
          if (
            ['name', 'dept', 'assetid', 'computername', 'device', 'devicetype', 'img'].includes(col)
          ) {
            repairRow[col] = '';
          } else {
            repairRow[col] = formatValue(repair[col]);
          }
        }
        worksheet.addRow(repairRow);
      }
    }

    // Write to buffer and send as file response
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Filter_Assetlist.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    return res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).send('Error exporting data');
  }
});

router.get("/detail/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        // ตรวจสอบว่า ID ที่รับมาเป็น ObjectId ที่ถูกต้องหรือไม่
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "ID Invalid",
                success: false,
                error: ["ID is not a ObjectId"],
            });
        }

        // ค้นหาข้อมูลใน MongoDB ด้วย ID
        let assetlist = await assetlistModel.findById(id);

        // ถ้าไม่พบข้อมูลในฐานข้อมูล
        if (!assetlist) {
            return res.status(404).send({
                message: "Data not found",
                success: false,
            });
        }

    } catch (error) {
        console.error("Error fetching insertone:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});


router.get("/edit/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false,
            });
        }

        let assetlist = await assetlistModel.findById(id);
        let repair = await repairModel.findOne({ computername: id });

        if (!assetlist) {
            return res.status(404).send({
                message: "Assetlist data not found",
                success: false,
            });
        }

        res.render('editdetail', { data: { assetlist, repair } });
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});


router.put('/edit/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res, next) => {
    try {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: 'Invalid ID',
                success: false,
                error: ['ID is not a valid ObjectId'],
            });
        }

        // แยกข้อมูลสำหรับ assetlist และ repair ออกจาก req.body
        const assetlistData = {
            name: req.body.name,
            assetitlistsdate: req.body.assetitlistsdate,
            assetid: req.body.assetid,
            assetitlistscompany: req.body.assetitlistscompany,
            computername: req.body.computername,
            device: req.body.device,
            devicetype: req.body.devicetype,
            devicechoice: req.body.devicechoice,
            devicemodel: req.body.devicemodel,
            devicesn: req.body.devicesn,
            cpu: req.body.cpu,
            cputype: req.body.cputype,
            cpuassetaccountno: req.body.cpuassetaccountno,
            speed: req.body.speed,
            harddisk: req.body.harddisk,
            ram: req.body.ram,
            romdrive: req.body.romdrive,
            romdrivetype: req.body.romdrivetype,
            romsn: req.body.romsn,
            romassetid: req.body.romassetid,
            monitor: req.body.monitor,
            monitortype: req.body.monitortype,
            monitorsn: req.body.monitorsn,
            monitorassetid: req.body.monitorassetid,
            keyboard: req.body.keyboard,
            keyboardtype: req.body.keyboardtype,
            keyboardsn: req.body.keyboardsn,
            keyboardassetid: req.body.keyboardassetid,
            mouse: req.body.mouse,
            mousetype: req.body.mousetype,
            mousesn: req.body.mousesn,
            mouseassetid: req.body.mouseassetid,
            printer: req.body.printer,
            printertype: req.body.printertype,
            printermodel: req.body.printermodel,
            printersn: req.body.printersn,
            printerassetid: req.body.printerassetid,
            ups: req.body.ups,
            upstype: req.body.upstype,
            upsva: req.body.upsva,
            upstypemodel: req.body.upstypemodel,
            upstypesn: req.body.upstypesn,
            upstypeassetid: req.body.upstypeassetid,
            adaptor: req.body.adaptor,
            adaptorsn: req.body.adaptorsn,
            other1: req.body.other1,
            othersn: req.body.othersn,
            os: req.body.os,
            ostype: req.body.ostype,
            ossn: req.body.ossn,
            office: req.body.office,
            officetype: req.body.officetype,
            officesn: req.body.officesn,
            antivirus: req.body.antivirus,
            pdf: req.body.pdf,
            utility: req.body.utility,
            other2: req.body.other2,
            mapdrive: req.body.mapdrive,
            addprinter: req.body.addprinter,
            other3: req.body.other3,
            assetitlistsremark: req.body.assetitlistsremark,
            dept: req.body.dept,
            deliverydate: req.body.deliverydate,
        };

        // ตรวจสอบและอัปเดตรูปภาพ
        console.log('Files:', req.files);
        if (req.files && req.files.img && req.files.img[0]) {
            console.log('Uploaded image filename:', req.files.img[0].filename);
            assetlistData.img = req.files.img[0].filename; // ใช้ชื่อไฟล์รูปภาพใหม่
        } else if (req.body.existingImage) {
            assetlistData.img = req.body.existingImage; // ใช้รูปภาพที่มีอยู่ในฐานข้อมูล
        }

        const repairData = {
            detailrepair: req.body.detailrepair,
            repairdate: req.body.repairdate,
            value: req.body.value,
            success: req.body.success,
            fail: req.body.fail,
            repairremark: req.body.repairremark,
            // เพิ่มฟิลด์ที่ต้องการอัปเดตอื่นๆ สำหรับ repair ที่นี่
        };

        // อัปเดตข้อมูล assetlist
        await assetlistModel.updateOne({ _id: id }, { $set: assetlistData });
        await repairModel.updateOne({ computername: id }, { $set: repairData });

        res.redirect('/Report/getalldetail');
    } catch (error) {
        console.error('Error updating data:', error);
        return res.status(500).send({ message: 'Server error', success: false });
    }
});


router.delete("/delete/:id", async function (req, res, next) {
    try {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "ID ไม่ถูกต้อง",
                success: false,
                error: ["ID ไม่ใช่ ObjectId ที่ถูกต้อง"],
            });
        }

        // ลบเอกสาร assetlist
        const deleteAssetlistResult = await assetlistModel.deleteOne({ _id: id });

        if (deleteAssetlistResult.deletedCount === 0) {
            return res.status(404).send({
                message: "ไม่พบเอกสาร",
                success: false,
            });
        }

        // ลบเอกสาร repair ที่เกี่ยวข้องกับ assetlist นี้
        const deleteRepairResult = await repairModel.deleteMany({ computername: id });

        console.log(`Deleted ${deleteRepairResult.deletedCount} repairs`);

        // ลบเอกสารสำเร็จ
        res.redirect('/Report/getalldetail');
    } catch (error) {
        console.error("ข้อผิดพลาดในการลบเอกสาร:", error);
        return res.status(500).send({
            message: "ข้อผิดพลาดของเซิร์ฟเวอร์",
            success: false,
        });
    }
});

router.get("/repair/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false
            });
        }

        const repair = await repairModel.findById(id).populate('computername');

        if (!repair) {
            return res.status(404).send({
                message: "Repair record not found",
                success: false
            });
        }

        res.render('editrepair', { repair }); // You must create `views/editrepair.ejs`
    } catch (error) {
        console.error("Error fetching repair:", error);
        return res.status(500).send({
            message: "Server error",
            success: false
        });
    }
});

router.put("/repair/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false
            });
        }

        const updateData = {
            detailrepair: req.body.detailrepair || "",
            value: req.body.value || "",
            success: req.body.success || "",
            fail: req.body.fail || "",
            repairremark: req.body.repairremark || "",
            repairdate: req.body.repairdate || new Date(),
        };

        const updated = await repairModel.updateOne({ _id: id }, { $set: updateData });

        if (updated.modifiedCount === 0) {
            return res.status(404).send({
                message: "Repair update failed or not found",
                success: false
            });
        }

        res.redirect("/Report/getalldetail");
    } catch (error) {
        console.error("Error updating repair:", error);
        return res.status(500).send({
            message: "Server error",
            success: false
        });
    }
});


router.delete("/repair/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false
            });
        }

        const deleted = await repairModel.deleteOne({ _id: id });

        if (deleted.deletedCount === 0) {
            return res.status(404).send({
                message: "Repair record not found",
                success: false
            });
        }

        res.redirect("/Report/getalldetail");
    } catch (error) {
        console.error("Error deleting repair:", error);
        return res.status(500).send({
            message: "Server error",
            success: false
        });
    }
});

router.get("/newowner/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "ID Invalid",
                success: false,
                error: ["ID is not a ObjectId"],
            });
        }

        let assetlist = await assetlistModel.findById(id).exec();
        if (!assetlist) {
            return res.status(404).send({
                message: "Data not found",
                success: false,
            });
        }

        let repair = await repairModel.findOne({ computername: assetlist._id }).exec();

        return res.render('newowner', { data: { assetlist, repair } });

    } catch (error) {
        console.error("Error fetching assetlist:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});







router.get("/newrepair/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "ID Invalid",
                success: false,
                error: ["ID is not a ObjectId"],
            });
        }

        let assetlist = await assetlistModel.findById(id).exec();
        if (!assetlist) {
            return res.status(404).send({
                message: "Asset data not found",
                success: false,
            });
        }

        let repair = await repairModel.findOne({ computername: assetlist._id }).exec();

        return res.render('repair', { data: { assetlist, repair } });

    } catch (error) {
        console.error("Error fetching assetlist:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});



module.exports = router;