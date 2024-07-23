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

        const nameExists = await assetlistModel.exists({ name });
        if (nameExists) {
            return res.status(400).send(`<script>alert('ชื่อซ้ำกับในฐานข้อมูล'); window.location.href='/assetlist/getalldetail';</script>`);
        }

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
        


       res.redirect(`/assetlist/getalldetail`);

    } catch (error) {
        console.error("Error creating entry:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});

// การไม่บันทึก repair ลงฐานข้อมูลหากไม่กรอก

// router.post("/inputassetlist", upload.fields([
//     { name: 'img', maxCount: 1 },
//     { name: 'pdf', maxCount: 1 }
// ]), async function (req, res, next) {
//     try {
//         const {    
//             name,
//             assetitlistsdate,
//             assetid,
//             assetitlistscompany,
//             computername,
//             device,
//             devicetype,
//             devicechoice,
//             devicemodel,
//             devicesn,
//             cpu,
//             cputype,
//             cpuassetaccountno,
//             speed,
//             harddisk,
//             ram,
//             romdrive,
//             romdrivetype,
//             romsn,
//             romassetid,
//             monitor,
//             monitortype,
//             monitorsn,
//             monitorassetid,
//             keyboard,
//             keyboardtype,
//             keyboardsn,
//             keyboardassetid,
//             mouse,
//             mousetype,
//             mousesn,
//             mouseassetid,
//             printer,
//             printertype,
//             printermodel,
//             printersn,
//             printerassetid,
//             ups,
//             upstype,
//             upsva,
//             upstypemodel,
//             upstypesn,
//             upstypeassetid,
//             adaptor,
//             adaptorsn,
//             other1,
//             othersn,
//             os,
//             ostype,
//             ossn,
//             office,
//             officetype,
//             officesn,
//             antivirus,
//             pdf,
//             utility, 
//             other2,
//             mapdrive,
//             addprinter,
//             other3,
//             assetitlistsremark,
//             dept,
//             deliverydate,
//             detailrepair,
//             repairdate,
//             value,
//             success,
//             fail,
//             repairremark,
//         } = req.body;

//         // Check required fields
//         if (!name || !assetid || !devicesn) {
//             return res.status(400).send(`<script>alert('กรุณากรอกข้อมูลที่จำเป็น'); window.location.href='/assetlist';</script>`);
//         }

//         // Check if name already exists
//         const nameExists = await assetlistModel.exists({ name });
//         if (nameExists) {
//             return res.status(400).send(`<script>alert('ชื่อซ้ำกับในฐานข้อมูล'); window.location.href='/assetlist';</script>`);
//         }

//         // Process image upload
//         let img = "";
//         if (req.files.img) {
//             img = req.files.img[0].filename;  // เก็บชื่อไฟล์รูปภาพ
//         } else if (req.body.existingImage) {
//             img = req.body.existingImage;  // ใช้รูปภาพที่มีอยู่ในฐานข้อมูล
//         }

//         // Create new assetlist entry
//         const newassetlist = new assetlistModel({
//             name: name || "",
//             assetitlistsdate: assetitlistsdate || null,
//             assetid: assetid || "",
//             img: img || "",
//             assetitlistscompany: assetitlistscompany || "",
//             computername: computername || "",
//             device: device || "",
//             devicetype: devicetype || "",
//             devicechoice: devicechoice || "", 
//             devicemodel: devicemodel || "",
//             devicesn: devicesn || "",
//             cpu: cpu || "",
//             cputype: cputype || "",
//             cpuassetaccountno: cpuassetaccountno || "",
//             speed: speed || "",
//             harddisk: harddisk || "",
//             ram: ram || "",
//             romdrive: romdrive || "",
//             romdrivetype: romdrivetype || "",
//             romsn: romsn || "",
//             romassetid: romassetid || "",
//             monitor: monitor || "",
//             monitortype: monitortype || "",
//             monitorsn: monitorsn || "",
//             monitorassetid: monitorassetid || "",
//             keyboard: keyboard || "",
//             keyboardtype: keyboardtype || "",
//             keyboardsn: keyboardsn || "",
//             keyboardassetid: keyboardassetid || "",
//             mouse: mouse || "",
//             mousetype: mousetype || "",
//             mousesn: mousesn || "",
//             mouseassetid: mouseassetid || "",
//             printer: printer || "",
//             printertype: printertype || "",
//             printermodel: printermodel || "",
//             printersn: printersn || "",
//             printerassetid: printerassetid || "",
//             ups: ups || "",
//             upstype: upstype || "",
//             upsva: upsva || "",
//             upstypemodel: upstypemodel || "",
//             upstypesn: upstypesn || "",
//             upstypeassetid: upstypeassetid || "",
//             adaptor: adaptor || "",
//             adaptorsn: adaptorsn || "",
//             other1: other1 || "",
//             othersn: othersn || "",
//             os: os || "",
//             ostype: ostype || "",
//             ossn: ossn || "",
//             office: office || "",
//             officetype: officetype || "",
//             officesn: officesn || "",
//             antivirus: antivirus || "",
//             pdf: pdf || "",
//             utility: utility || "",
//             other2: other2 || "",
//             mapdrive: mapdrive || "",
//             addprinter: addprinter || "",
//             other3: other3 || "",
//             assetitlistsremark: assetitlistsremark || "", 
//             dept: dept || "",
//             deliverydate: deliverydate || "",
//         });

//         // Save assetlist entry
//         let assetlist = await newassetlist.save();

//         // Check if detailrepair is provided
//         if (detailrepair) {
//             // Create new repair entry
//             const newRepair = new repairModel({
//                 detailrepair,
//                 value: value || "",
//                 success: success || "",
//                 fail: fail || "",
//                 repairremark: repairremark || "",
//                 repairdate: repairdate || null,
//                 total: "",  // Calculate total if needed
//                 computername: assetlist._id,   // Reference to the saved assetlist
//             });

//             // Save repair entry
//             const savedRepair = await newRepair.save();

//             // Update assetlist to include this repair
//             assetlist.repairs.push(savedRepair._id);
//             await assetlist.save();
//         }

//         res.redirect(`/assetlist/getalldetail`);

//     } catch (error) {
//         console.error("Error creating entry:", error);
//         return res.status(500).send({
//             message: "Server error",
//             success: false,
//         });
//     }
// });


// router.get('/search', async (req, res) => {
//     const { query } = req.query;

//     try {
//         const regex = new RegExp(query, 'i'); // ค้นหาแบบไม่สนใจตัวพิมพ์ใหญ่-เล็ก
//         const results = await assetlistModel.find({
//             $or: [
//                 { name: regex },
//                 { assetid: regex },
//                 { devicesn: regex }
//             ]
//         }).populate('repairs'); // Populate ข้อมูล repair ที่เกี่ยวข้อง

//         // คำนวณ total value สำหรับแต่ละ assetlist
//         results.forEach(asset => {
//             asset.totalValue = asset.repairs.reduce((acc, repair) => acc + parseFloat(repair.value || 0), 0);
//         });

//         res.render('detail', { data: results }); // Render template พร้อมกับผลการค้นหาและข้อมูล repair ที่เกี่ยวข้อง
//     } catch (error) {
//         console.error('Error searching:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// router.get('/search', async (req, res) => {
//     const { query, page = 1, limit = 3 } = req.query;

//     try {
//         const regex = new RegExp(query, 'i'); // ค้นหาแบบไม่สนใจตัวพิมพ์ใหญ่-เล็ก
//         const results = await assetlistModel.find({
//             $or: [
//                 { name: regex },
//                 { assetid: regex },
//                 { devicesn: regex }
//             ]
//         })
//         .populate('repairs') // Populate ข้อมูล repair ที่เกี่ยวข้อง
//         .skip((page - 1) * limit) // ข้ามข้อมูลก่อนหน้า
//         .limit(parseInt(limit)); // จำกัดจำนวนข้อมูล

//         // คำนวณ total value สำหรับแต่ละ assetlist
//         results.forEach(asset => {
//             asset.totalValue = asset.repairs.reduce((acc, repair) => acc + parseFloat(repair.value || 0), 0);
//         });

//         // นับจำนวนข้อมูลทั้งหมดที่ตรงกับ query
//         const count = await assetlistModel.countDocuments({
//             $or: [
//                 { name: regex },
//                 { assetid: regex },
//                 { devicesn: regex }
//             ]
//         });

//         res.render('detail', { 
//             data: results, 
//             totalPages: Math.ceil(count / limit), 
//             currentPage: parseInt(page), 
//             query 
//         }); // Render template พร้อมกับผลการค้นหาและข้อมูล repair ที่เกี่ยวข้อง
//     } catch (error) {
//         console.error('Error searching:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

router.get('/search', async (req, res) => {
    const { query, page = 1, limit = 3 } = req.query;

    try {
        const regex = new RegExp(query, 'i'); // ค้นหาแบบไม่สนใจตัวพิมพ์ใหญ่-เล็ก
        const results = await assetlistModel.find({
            $or: [
                { name: regex },
                { assetid: regex },
                { devicesn: regex }
            ]
        })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('repairs'); // Populate ข้อมูล repair ที่เกี่ยวข้อง

        // คำนวณ total value สำหรับแต่ละ assetlist
        results.forEach(asset => {
            asset.totalValue = asset.repairs.reduce((acc, repair) => acc + parseFloat(repair.value || 0), 0);
        });

        // นับจำนวนข้อมูลทั้งหมด
        const count = await assetlistModel.countDocuments({
            $or: [
                { name: regex },
                { assetid: regex },
                { devicesn: regex }
            ]
        });

        res.render('detail', {
            data: results,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            query: query,
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});




router.get("/getalldetail", async function (req, res, next) {
    const { query, page = 1, limit = 3 } = req.query;

    try {
        let assetlist = await assetlistModel.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Fetch repairs for each asset and populate computername
        for (let item of assetlist) {
            item.repairs = await repairModel.find({ computername: item._id }).populate('computername').lean();

            // Calculate total value for each computername
            item.totalValue = (item.repairs || []).reduce((sum, repair) => sum + parseFloat(repair.value || 0), 0);
        }

        // Calculate total value for all computername
        let total = assetlist.reduce((acc, item) => acc + item.totalValue, 0);

        // นับจำนวนข้อมูลทั้งหมด
        const count = await assetlistModel.countDocuments();

        // ส่งข้อมูลที่ค้นหาได้และค่า total ไปยังผู้ใช้งาน
        return res.render('detail', {
            data: assetlist,
            total: total,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            message: "success",
            success: true,
        });
    } catch (error) {
        console.error("Error fetching assetlist:", error);
        return res.status(500).send({
            message: "server error",
            success: false,
        });
    }
});





// router.get("/getalldetail", async function (req, res, next) {
//     try {
//         let assetlist = await assetlistModel.find().lean();

//         // Fetch repairs for each asset and populate computername
//         for (let item of assetlist) {
//             item.repairs = await repairModel.find({ computername: item._id }).populate('computername').lean();

//             // Calculate total value for each computername
//             item.totalValue = (item.repairs || []).reduce((sum, repair) => sum + parseFloat(repair.value || 0), 0);
//         }

//         // Calculate total value for all computername
//         let total = assetlist.reduce((acc, item) => acc + item.totalValue, 0);

//         // ส่งข้อมูลที่ค้นหาได้และค่า total ไปยังผู้ใช้งาน
//         return res.render('detail', {
//             data: assetlist,
//             total: total,
//             message: "success",
//             success: true,
//         });
//     } catch (error) {
//         console.error("Error fetching assetlist:", error);
//         return res.status(500).send({
//             message: "server error",
//             success: false,
//         });
//     }
// });



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

        res.redirect('/assetlist/getalldetail');
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
        res.redirect('/assetlist/getalldetail');
    } catch (error) {
        console.error("ข้อผิดพลาดในการลบเอกสาร:", error);
        return res.status(500).send({
            message: "ข้อผิดพลาดของเซิร์ฟเวอร์",
            success: false,
        });
    }
});



// router.get('/export', async (req, res) => {
//     try {
//         const selectedColumns = req.query.columns;


//         const assetlist = await assetlistModel.find();
//         const repair = await repairModel.find();

//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('AssetsList');

//         // Define columns for AssetsList worksheet
//         worksheet.columns = [
//             { header: 'Name', key: 'name', width: 20 },
//             { header: 'Department', key: 'dept', width: 20 },
//             { header: 'Date', key: 'assetitlistsdate', width: 20 },
//             { header: 'Asset ID', key: 'assetid', width: 20 },
//             { header: 'Company', key: 'assetitlistscompany', width: 30 },
//             { header: 'Computer Name', key: 'computername', width: 20 },
//             { header: 'Device', key: 'device', width: 20 },
//             { header: 'Device Type', key: 'devicetype', width: 20 },
//             { header: 'Device Choice', key: 'devicechoice', width: 20 },
//             { header: 'Device Model', key: 'devicemodel', width: 20 },
//             { header: 'Device SN', key: 'devicesn', width: 20 },
//             { header: 'CPU', key: 'cpu', width: 20 },
//             { header: 'CPU Type', key: 'cputype', width: 20 },
//             { header: 'CPU Asset Account No', key: 'cpuassetaccountno', width: 20 },
//             { header: 'Speed', key: 'speed', width: 20 },
//             { header: 'Hard Disk', key: 'harddisk', width: 20 },
//             { header: 'RAM', key: 'ram', width: 20 },
//             { header: 'Image', key: 'img', width: 30 },
//             { header: 'ROM Drive', key: 'romdrive', width: 20 },
//             { header: 'ROM Drive Type', key: 'romdrivetype', width: 20 },
//             { header: 'ROM SN', key: 'romsn', width: 20 },
//             { header: 'ROM Asset ID', key: 'romassetid', width: 20 },
//             { header: 'Monitor', key: 'monitor', width: 20 },
//             { header: 'Monitor Type', key: 'monitortype', width: 20 },
//             { header: 'Monitor SN', key: 'monitorsn', width: 20 },
//             { header: 'Monitor Asset ID', key: 'monitorassetid', width: 20 },
//             { header: 'Keyboard', key: 'keyboard', width: 20 },
//             { header: 'Keyboard Type', key: 'keyboardtype', width: 20 },
//             { header: 'Keyboard SN', key: 'keyboardsn', width: 20 },
//             { header: 'Keyboard Asset ID', key: 'keyboardassetid', width: 20 },
//             { header: 'Mouse', key: 'mouse', width: 20 },
//             { header: 'Mouse Type', key: 'mousetype', width: 20 },
//             { header: 'Mouse SN', key: 'mousesn', width: 20 },
//             { header: 'Mouse Asset ID', key: 'mouseassetid', width: 20 },
//             { header: 'Printer', key: 'printer', width: 20 },
//             { header: 'Printer Type', key: 'printertype', width: 20 },
//             { header: 'Printer Model', key: 'printermodel', width: 20 },
//             { header: 'Printer SN', key: 'printersn', width: 20 },
//             { header: 'Printer Asset ID', key: 'printerassetid', width: 20 },
//             { header: 'UPS', key: 'ups', width: 20 },
//             { header: 'UPS Type', key: 'upstype', width: 20 },
//             { header: 'UPS VA', key: 'upsva', width: 20 },
//             { header: 'UPS Type Model', key: 'upstypemodel', width: 20 },
//             { header: 'UPS Type SN', key: 'upstypesn', width: 20 },
//             { header: 'UPS Type Asset ID', key: 'upstypeassetid', width: 20 },
//             { header: 'Adaptor', key: 'adaptor', width: 20 },
//             { header: 'Adaptor SN', key: 'adaptorsn', width: 20 },
//             { header: 'Other1', key: 'other1', width: 20 },
//             { header: 'Other SN', key: 'othersn', width: 20 },
//             { header: 'OS', key: 'os', width: 20 },
//             { header: 'OS Type', key: 'ostype', width: 20 },
//             { header: 'OS SN', key: 'ossn', width: 20 },
//             { header: 'Office', key: 'office', width: 20 },
//             { header: 'Office Type', key: 'officetype', width: 20 },
//             { header: 'Office SN', key: 'officesn', width: 20 },
//             { header: 'Antivirus', key: 'antivirus', width: 20 },
//             { header: 'PDF', key: 'pdf', width: 20 },
//             { header: 'Utility', key: 'utility', width: 20 },
//             { header: 'Other2', key: 'other2', width: 20 },
//             { header: 'Map Drive', key: 'mapdrive', width: 20 },
//             { header: 'Add Printer', key: 'addprinter', width: 20 },
//             { header: 'Other3', key: 'other3', width: 20 },
//             { header: 'Remark', key: 'assetitlistsremark', width: 20 },
//             { header: 'Delivery Date', key: 'deliverydate', width: 20 },           
//             { header: 'Detail Repair', key: 'detailrepair', width: 20 },
//             { header: 'Value', key: 'value', width: 20 },
//             { header: 'Success', key: 'success', width: 20 },
//             { header: 'Fail', key: 'fail', width: 20 },
//             { header: 'Repair Remark', key: 'repairremark', width: 20 },     
//             { header: 'Repair Date', key: 'repairdate', width: 20 },
//             { header: 'Total', key: 'total', width: 20 },
//         ];


        
//         // Populate data for assetlist
//         assetlist.forEach(asset => {
//             const row = worksheet.addRow({
//                 name: asset.name,
//                 assetitlistsdate: asset.assetitlistsdate ? asset.assetitlistsdate.toISOString().substring(0, 10) : '',
//                 assetid: asset.assetid,
//                 assetitlistscompany: asset.assetitlistscompany.join(', '),
//                 computername: asset.computername,
//                 device: asset.device.join(', '),
//                 devicetype: asset.devicetype.join(', '),
//                 devicechoice: asset.devicechoice.join(', '),
//                 devicemodel: asset.devicemodel,
//                 devicesn: asset.devicesn,
//                 cpu: asset.cpu.join(', '),
//                 cputype: asset.cputype.join(', '),
//                 cpuassetaccountno: asset.cpuassetaccountno,
//                 speed: asset.speed.join(', '),
//                 harddisk: asset.harddisk.join(', '),
//                 ram: asset.ram.join(', '),
//                 img: asset.img,
//                 romdrive: asset.romdrive.join(', '),
//                 romsn: asset.romsn,
//                 romassetid: asset.romassetid,
//                 monitor: asset.monitor.join(', '),
//                 monitortype: asset.monitortype.join(', '),
//                 monitorsn: asset.monitorsn,
//                 monitorassetid: asset.monitorassetid,
//                 keyboard: asset.keyboard.join(', '),
//                 keyboardtype: asset.keyboardtype.join(', '),
//                 keyboardsn: asset.keyboardsn,
//                 keyboardassetid: asset.keyboardassetid,
//                 mouse: asset.mouse.join(', '),
//                 mousetype: asset.mousetype.join(', '),
//                 mousesn: asset.mousesn,
//                 mouseassetid: asset.mouseassetid,
//                 printer: asset.printer.join(', '),
//                 printertype: asset.printertype.join(', '),
//                 printermodel: asset.printermodel,
//                 printersn: asset.printersn,
//                 printerassetid: asset.printerassetid,
//                 ups: asset.ups.join(', '),
//                 upstype: asset.upstype.join(', '),
//                 upsva: asset.upsva.join(', '),
//                 upstypemodel: asset.upstypemodel,
//                 upstypesn: asset.upstypesn,
//                 upstypeassetid: asset.upstypeassetid,
//                 adaptor: asset.adaptor.join(', '),
//                 adaptorsn: asset.adaptorsn,
//                 other1: asset.other1,
//                 othersn: asset.othersn,
//                 os: asset.os.join(', '),
//                 ostype: asset.ostype.join(', '),
//                 ossn: asset.ossn,
//                 office: asset.office.join(', '),
//                 officetype: asset.officetype.join(', '),
//                 officesn: asset.officesn,
//                 antivirus: asset.antivirus.join(', '),
//                 pdf: asset.pdf.join(', '),
//                 utility: asset.utility.join(', '),
//                 other2: asset.other2,
//                 mapdrive: asset.mapdrive,
//                 addprinter: asset.addprinter,
//                 other3: asset.other3,
//                 assetitlistsremark: asset.assetitlistsremark,
//                 dept: asset.dept,
//                 deliverydate: asset.deliverydate ? asset.deliverydate.toISOString().substring(0, 10) : '',
//             });

//             // Add image if available
//             if (asset.img) {
//                 const imgPath = path.join(__dirname, '../public/images/', asset.img); // Adjust the path accordingly
//                 if (fs.existsSync(imgPath)) {
//                     const imageId = workbook.addImage({
//                         filename: imgPath,
//                         extension: path.extname(imgPath).slice(1),
//                     });

//                     const dimensions = sizeOf(imgPath);
//                     const cell = worksheet.getCell(`R${row.number}`); // Change Q to the column where you want to add the image
//                     worksheet.addImage(imageId, {
//                         tl: { col: cell.col - 1, row: cell.row - 1 },
//                         ext: { width: dimensions.width / 4, height: dimensions.height / 4 }, // Adjust size as needed
//                     });

//                     // Adjust the row height to fit the image
//                     worksheet.getRow(row.number).height = dimensions.height / 4;
//                 }
//             }
//         });

//         // Add repair data to worksheet
//         repair.forEach(asset => {
//             const row = worksheet.addRow({
//                 detailrepair: asset.detailrepair,
//                 value: asset.value,
//                 success: asset.success,
//                 fail: asset.fail,
//                 repairremark: asset.repairremark,
//                 repairdate: asset.repairdate ? asset.repairdate.toISOString().substring(0, 10) : '',
//                 total: asset.total,
//             });
//         });

//         // Set response headers for Excel file download
//         res.setHeader(
//             'Content-Type',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         );
//         res.setHeader(
//             'Content-Disposition',
//             'attachment; filename=' + 'assets.xlsx'
//         );

//         // Write Excel to response stream and end response
//         await workbook.xlsx.write(res);
//         res.end();
//     } catch (err) {
//         console.error('Export to Excel error:', err);
//         res.status(500).send('Export to Excel failed. Please try again.');
//     }
// });






router.get('/export', async (req, res) => {
    try {
        // ตรวจสอบค่าพารามิเตอร์ columns ที่รับมาจาก query
        console.log('Received columns:', req.query.columns);

        // ถอดรหัสค่า columns และแยกค่า
        const columnsParam = decodeURIComponent(req.query.columns);
        if (!columnsParam || typeof columnsParam !== 'string') {
            return res.status(400).send('ค่าพารามิเตอร์ columns ไม่ถูกต้องหรือหายไป');
        }

        // แยกค่าโดยใช้เครื่องหมายคอมมา
        const selectedColumns = columnsParam.replace(/^\[|\]$/g, '').split(',').map(col => col.trim());

        if (selectedColumns.length === 0) {
            return res.status(400).send('ไม่ได้เลือกคอลัมน์ใด ๆ สำหรับการส่งออก');
        }

        // ดึงข้อมูลจากฐานข้อมูล
        const assetlist = await assetlistModel.find();
        const repair = await repairModel.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('AssetsList');

        // กำหนดคอลัมน์ทั้งหมดที่มีอยู่
        const allColumns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Department', key: 'dept', width: 20 },
            { header: 'Date', key: 'assetitlistsdate', width: 20 },
            { header: 'Asset Account No', key: 'cpuassetaccountno', width: 20 },
            { header: 'Asset ID', key: 'assetid', width: 20 },
            { header: 'Company', key: 'assetitlistscompany', width: 30 },
            { header: 'Computer Name', key: 'computername', width: 20 },
            { header: 'Brand', key: 'device', width: 20 },
            { header: 'Device Type', key: 'devicetype', width: 20 },
            { header: 'Device Choice', key: 'devicechoice', width: 20 },
            { header: 'Model', key: 'devicemodel', width: 20 },
            { header: 'SN', key: 'devicesn', width: 20 },
            { header: 'CPU', key: 'cpu', width: 20 },
            { header: 'CPU Type', key: 'cputype', width: 20 },
            { header: 'Speed', key: 'speed', width: 20 },
            { header: 'Hard Disk', key: 'harddisk', width: 20 },
            { header: 'RAM', key: 'ram', width: 20 },
            { header: 'ROM Drive Brand', key: 'romdrive', width: 20 },
            { header: 'ROM Drive Type', key: 'romdrivetype', width: 20 },
            { header: 'SN', key: 'romsn', width: 20 },
            { header: 'Asset ID', key: 'romassetid', width: 20 },
            { header: 'Monitor Brand', key: 'monitor', width: 20 },
            { header: 'Monitor Size', key: 'monitortype', width: 20 },
            { header: 'SN', key: 'monitorsn', width: 20 },
            { header: 'Asset ID', key: 'monitorassetid', width: 20 },
            { header: 'Keyboard Brand', key: 'keyboard', width: 20 },
            { header: 'Keyboard Type', key: 'keyboardtype', width: 20 },
            { header: 'SN', key: 'keyboardsn', width: 20 },
            { header: 'Asset ID', key: 'keyboardassetid', width: 20 },
            { header: 'Mouse', key: 'mouse', width: 20 },
            { header: 'Mouse Type', key: 'mousetype', width: 20 },
            { header: 'SN', key: 'mousesn', width: 20 },
            { header: 'Asset ID', key: 'mouseassetid', width: 20 },
            { header: 'Printer Brand', key: 'printer', width: 20 },
            { header: 'Printer Type', key: 'printertype', width: 20 },
            { header: 'Model', key: 'printermodel', width: 20 },
            { header: 'SN', key: 'printersn', width: 20 },
            { header: 'Asset ID', key: 'printerassetid', width: 20 },
            { header: 'UPS Type', key: 'ups', width: 20 },
            { header: 'UPS Brand', key: 'upstype', width: 20 },
            { header: 'UPS VA', key: 'upsva', width: 20 },
            { header: 'Model', key: 'upstypemodel', width: 20 },
            { header: 'SN', key: 'upstypesn', width: 20 },
            { header: 'Asset ID', key: 'upstypeassetid', width: 20 },
            { header: 'Adaptor Brand', key: 'adaptor', width: 20 },
            { header: 'SN', key: 'adaptorsn', width: 20 },
            { header: 'Hardware Other', key: 'other1', width: 20 },
            { header: 'SN', key: 'othersn', width: 20 },
            { header: 'Windown OS', key: 'os', width: 20 },
            { header: 'OS Type', key: 'ostype', width: 20 },
            { header: 'SN', key: 'ossn', width: 20 },
            { header: 'Microsoft Office ', key: 'office', width: 20 },
            { header: 'Office Type', key: 'officetype', width: 20 },
            { header: 'SN', key: 'officesn', width: 20 },
            { header: 'Antivirus', key: 'antivirus', width: 20 },
            { header: 'PDF', key: 'pdf', width: 20 },
            { header: 'Utility', key: 'utility', width: 20 },
            { header: 'Software Other', key: 'other2', width: 20 },
            { header: 'Map Drive', key: 'mapdrive', width: 20 },
            { header: 'Add Printer', key: 'addprinter', width: 20 },
            { header: 'Other', key: 'other3', width: 20 },
            { header: 'Remark', key: 'assetitlistsremark', width: 20 },
            { header: 'Delivery Date', key: 'deliverydate', width: 20 },
            { header: 'Image', key: 'img', width: 40 },
            { header: 'Detail Repair', key: 'detailrepair', width: 20 },
            { header: 'Value', key: 'value', width: 20 },
            { header: 'Success', key: 'success', width: 20 },
            { header: 'Fail', key: 'fail', width: 20 },
            { header: 'Repair Remark', key: 'repairremark', width: 20 },
            { header: 'Repair Date', key: 'repairdate', width: 20 },
            { header: 'Total', key: 'total', width: 20 },
        ];

        const columnsToExport = allColumns.filter(col => selectedColumns.includes(col.key));
        worksheet.columns = columnsToExport;

        // Center text in all columns
        worksheet.columns.forEach(column => {
            column.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // หาตำแหน่งของคอลัมน์ 'img' เพื่อการแทรกรูปภาพ
        const imgColumnIndex = columnsToExport.findIndex(col => col.key === 'img') + 1;

        assetlist.forEach(asset => {
            const row = {};
            columnsToExport.forEach(col => {
                if (col.key === 'img') {
                    // ข้ามการตั้งค่าค่าของคอลัมน์ 'img' เพื่อไม่ให้มีชื่อไฟล์แสดงในเซลล์
                    return;
                }
                // แปลงข้อมูลที่เป็นอาร์เรย์ให้เป็นสตริง โดยถ้ามีเพียงหนึ่งค่า ให้ใช้ค่านั้นโดยตรง
                if (Array.isArray(asset[col.key])) {
                    row[col.key] = asset[col.key].filter(value => value).join(', ') || '';
                } else {
                    row[col.key] = asset[col.key] || '';
                }
            });

            const nonEmptyValues = Object.values(row).some(value => value !== '');
            if (nonEmptyValues) {
                const newRow = worksheet.addRow(row);
                if (asset.img && imgColumnIndex) {
                    const imgPath = path.join(__dirname, '../public/images/', asset.img);
                    if (fs.existsSync(imgPath)) {
                        const imageId = workbook.addImage({
                            filename: imgPath,
                            extension: path.extname(imgPath).slice(1),
                        });

                        const dimensions = sizeOf(imgPath);
                        const cell = worksheet.getCell(newRow.getCell(imgColumnIndex).address);
                        worksheet.addImage(imageId, {
                            tl: { col: cell.col - 1, row: cell.row - 1 },
                            ext: { width: dimensions.width / 4, height: dimensions.height / 4 },
                        });

                        newRow.height = dimensions.height / 4;
                    }
                }
            }

            const repairsForAsset = repair.filter(rep => rep.computername.toString() === asset._id.toString());

            repairsForAsset.forEach(rep => {
                const repairRow = {};
                columnsToExport.forEach(col => {
                    if (!['computername', '_id'].includes(col.key)) {
                        // แปลงข้อมูลที่เป็นอาร์เรย์ให้เป็นสตริง โดยถ้ามีเพียงหนึ่งค่า ให้ใช้ค่านั้นโดยตรง
                        if (Array.isArray(rep[col.key])) {
                            repairRow[col.key] = rep[col.key].filter(value => value).join(', ') || '';
                        } else {
                            repairRow[col.key] = rep[col.key] || '';
                        }
                    }
                });

                const nonEmptyRepairValues = Object.values(repairRow).some(value => value !== '');
                if (nonEmptyRepairValues) {
                    worksheet.addRow(repairRow);
                }
            });
        });

        // สร้างไฟล์ Excel ชั่วคราวและดาวน์โหลด
        const tempFilePath = path.join(__dirname, 'exported_data.xlsx');
        await workbook.xlsx.writeFile(tempFilePath);

        res.download(tempFilePath, 'exported_data.xlsx', err => {
            if (err) {
                console.error(err);
                res.status(500).send('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
            }
            fs.unlinkSync(tempFilePath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดขณะทำการส่งออกข้อมูล');
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






router.get("/editrepair/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false,
            });
        }

        let repair = await repairModel.findById(id).populate('computername');

        if (!repair) {
            return res.status(404).send({
                message: "Repair data not found",
                success: false,
            });
        }

        res.render('editrepair', { data: { repair } });
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});

// เส้นทางจัดการการส่งข้อมูลฟอร์มแก้ไข
router.put("/editrepair/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false,
            });
        }

        let updateData = {
            detailrepair: req.body.detailrepair,
            value: req.body.value,
            success: req.body.success,
            fail: req.body.fail,
            repairremark: req.body.repairremark,
            repairdate: new Date(req.body.repairdate),
            total: req.body.total
        };

        let repair = await repairModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!repair) {
            return res.status(404).send({
                message: "Repair data not found",
                success: false,
            });
        }

        res.redirect(`/assetlist/getalldetail`);
    } catch (error) {
        console.error("Error updating data:", error);
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








// router.post("/newrepair/:id", async function (req, res, next) {
//     try {
//         let id = req.params.id;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).send({
//                 message: "Invalid ID",
//                 success: false,
//             });
//         }

//         let asset = await assetlistModel.findById(id);
//         if (!asset) {
//             return res.status(404).send({
//                 message: "Asset data not found",
//                 success: false,
//             });
//         }

//         // Log the received form data
//         console.log("Received form data:", req.body);

//         // Validate repairdate before saving
//         let repairDate = new Date(req.body.repairdate);
//         if (isNaN(repairDate.getTime())) {
//             return res.status(400).send({
//                 message: "Invalid repair date format",
//                 success: false,
//             });
//         }

//         let newRepair = {
//             detailrepair: req.body.detailrepair,
//             value: req.body.value,
//             success: req.body.success === 'success', // ตรวจสอบว่า checkbox success ถูกติ๊กหรือไม่
//             fail: req.body.fail === 'fail', // ตรวจสอบว่า checkbox fail ถูกติ๊กหรือไม่
//             repairremark: req.body.repairremark,
//             repairdate: repairDate,
//             total: req.body.total,
//             computername: id,
//         };
        

//         let createdRepair = await repairModel.create(newRepair);

//         res.redirect(`/assetlist/getalldetail`);

//     } catch (error) {
//         console.error("Error creating new repair:", error);
//         return res.status(500).send({
//             message: "Server error",
//             success: false,
//         });
//     }
// });



router.post("/newrepair/:id", async function (req, res, next) {
    try {
        let id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid ID",
                success: false,
            });
        }

        let asset = await assetlistModel.findById(id);
        if (!asset) {
            return res.status(404).send({
                message: "Asset data not found",
                success: false,
            });
        }

        // Log the received form data
        console.log("Received form data:", req.body);

        // Validate repairdate before saving
        let repairDate = new Date(req.body.repairdate);
        if (isNaN(repairDate.getTime())) {
            return res.status(400).send({
                message: "Invalid repair date format",
                success: false,
            });
        }

        const {            
            detailrepair,
            repairdate,
            value,
            success,
            fail,
            repairremark,
        } = req.body;

        // Determine success or fail based on checkbox values
        let isSuccessful = req.body.success === 'success';
        let isFailed = req.body.fail === 'fail';

        const newRepair = {
            detailrepair: detailrepair || "",
            value: value || "",
            success: req.body.success, // ใช้ค่าที่ส่งมาจากฟอร์มเลย
            fail: req.body.fail, // ใช้ค่าที่ส่งมาจากฟอร์มเลย
            repairremark: repairremark || "",
            repairdate: repairdate || null,
            total: "", // หากต้องการคำนวณ total สามารถทำได้ตามที่ต้องการ
            computername: asset._id, // อ้างอิงไปยัง assetlist ที่บันทึกไว้
        };
        

        let createdRepair = await repairModel.create(newRepair);

        // อัพเดต assetlist ด้วย repair ใหม่
        asset.repairs.push(createdRepair._id);
        await asset.save();

        

        res.redirect(`/assetlist/getalldetail`);

    } catch (error) {
        console.error("Error creating new repair:", error);
        return res.status(500).send({
            message: "Server error",
            success: false,
        });
    }
});

module.exports = router;
