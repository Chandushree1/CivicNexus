// Run with: npm run seed
// Populates demo users + complaints + notifications matching the original design mock.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

const run = async () => {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Complaint.deleteMany({}), Notification.deleteMany({})]);

  console.log("Creating demo users...");
  const citizen = await User.create({
    fullName: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    phone: "+91 98765 43210",
    password: "password123",
    role: "citizen",
    address: "402, Lake View Apartments, 5th Block, Koramangala",
    city: "Bengaluru",
  });

  const officer = await User.create({
    fullName: "Ramesh Iyer",
    email: "ramesh.iyer@civicconnect.gov.in",
    phone: "+91 90000 11111",
    password: "password123",
    role: "officer",
    designation: "Junior Engineer",
    department: "Roads & Potholes",
    ward: "Ward 84, Koramangala",
    location: { lat: 12.9352, lng: 77.6245 },
  });

  const admin = await User.create({
    fullName: "Deepa Rao",
    email: "admin@civicconnect.gov.in",
    phone: "+91 90000 22222",
    password: "password123",
    role: "admin",
    designation: "Ward Administrator",
  });

  const otherOfficers = await User.create([
    {
      fullName: "Sunita Deshpande",
      email: "sunita.d@civicconnect.gov.in",
      password: "password123",
      role: "officer",
      designation: "Assistant Engineer",
      department: "Garbage",
    },
    {
      fullName: "Arun Kumar",
      email: "arun.kumar@civicconnect.gov.in",
      password: "password123",
      role: "officer",
      designation: "Assistant Engineer",
      department: "Electricity",
    },
  ]);

  console.log("Creating demo complaints...");
  const complaintDefs = [
    {
      complaintId: "CC-2026-001245",
      category: "Garbage",
      title: "Garbage not collected for 6 days near 5th Block park",
      description: "Waste has piled up near the park entrance and is attracting stray animals.",
      priority: "High",
      status: "In Progress",
      location: { address: "5th Block, Koramangala, near Jyoti Nivas College", lat: 12.9352, lng: 77.6245, ward: "Ward 84" },
      assignedOfficer: otherOfficers[0]._id,
      daysAgo: 20,
    },
    {
      complaintId: "CC-2026-001246",
      category: "Roads & Potholes",
      title: "Deep pothole causing two-wheeler skids on 80 Feet Road",
      description: "A large pothole has formed after recent rains, causing accidents.",
      priority: "Urgent",
      status: "Resolved",
      location: { address: "80 Feet Road, 4th Block, Koramangala", lat: 12.9345, lng: 77.6230, ward: "Ward 84" },
      assignedOfficer: officer._id,
      resolved: true,
      rating: 5,
      daysAgo: 31,
    },
    {
      complaintId: "CC-2026-001247",
      category: "Streetlights",
      title: "Streetlight pole dark for two weeks on 12th Main",
      description: "The pole outside house no. 45 has not worked for two weeks.",
      priority: "High",
      status: "Assigned",
      location: { address: "12th Main, HSR Layout Sector 6", lat: 12.9121, lng: 77.6446, ward: "Ward 78" },
      assignedOfficer: otherOfficers[1]._id,
      daysAgo: 18,
    },
    {
      complaintId: "CC-2026-001248",
      category: "Drainage",
      title: "Drain overflowing onto footpath near bus stop",
      description: "Stagnant water on the footpath is a health hazard for commuters.",
      priority: "Urgent",
      status: "Under Review",
      location: { address: "Bellandur Gate, Outer Ring Road", lat: 12.9256, lng: 77.6784, ward: "Ward 78" },
      daysAgo: 15,
    },
    {
      complaintId: "CC-2026-001249",
      category: "Public Facilities",
      title: "Public toilet at market has no water supply",
      description: "The community toilet has had no running water for over a week.",
      priority: "Medium",
      status: "Submitted",
      location: { address: "Jayanagar 4th Block Market", lat: 12.9257, lng: 77.5834, ward: "Ward 91" },
      daysAgo: 14,
    },
    {
      complaintId: "CC-2026-001250",
      category: "Water Supply",
      title: "Water pipeline leaking for a week on 7th Cross",
      description: "A burst pipeline is wasting a large amount of water daily.",
      priority: "High",
      status: "In Progress",
      location: { address: "7th Cross, Jayanagar 4th Block", lat: 12.9279, lng: 77.5825, ward: "Ward 91" },
      daysAgo: 22,
    },
    {
      complaintId: "CC-2026-001252",
      category: "Electricity",
      title: "Hanging electric wires above footpath",
      description: "Live wires are hanging dangerously low near a school route.",
      priority: "Urgent",
      status: "Assigned",
      location: { address: "Sarjapur Main Road, HSR Layout", lat: 12.9101, lng: 77.6501, ward: "Ward 78" },
      assignedOfficer: otherOfficers[1]._id,
      daysAgo: 16,
    },
    {
      complaintId: "CC-2026-001254",
      category: "Drainage",
      title: "Open manhole cover missing near school gate",
      description: "A missing manhole cover poses a serious risk to children.",
      priority: "Urgent",
      status: "In Progress",
      location: { address: "Bellandur Main Road, near Vidya Niketan School", lat: 12.9241, lng: 77.6798, ward: "Ward 78" },
      daysAgo: 7,
    },
  ];

  const createdComplaints = [];
  for (const def of complaintDefs) {
    const createdAt = new Date(Date.now() - def.daysAgo * 24 * 60 * 60 * 1000);
    const complaint = await Complaint.create({
      complaintId: def.complaintId,
      citizen: citizen._id,
      category: def.category,
      title: def.title,
      description: def.description,
      priority: def.priority,
      status: def.status,
      location: def.location,
      assignedOfficer: def.assignedOfficer || null,
      rating: def.rating || null,
      resolution: def.resolved
        ? { note: "Pothole has been patched with hot-mix asphalt.", resolvedAt: createdAt, photoUrl: "" }
        : undefined,
      timeline: [{ status: "Submitted", note: "Complaint registered by citizen", createdAt }],
      createdAt,
      updatedAt: createdAt,
    });
    createdComplaints.push(complaint);
  }

  console.log("Creating demo notifications...");
  const byId = (id) => createdComplaints.find((c) => c.complaintId === id);
  const notifDefs = [
    {
      type: "officer_update",
      title: "Officer updated your complaint",
      message: "Sunita Deshpande: extra compactor scheduled tomorrow morning; the black spot will be cleared.",
      complaint: byId("CC-2026-001245"),
      daysAgo: 14,
      read: false,
    },
    {
      type: "complaint_submitted",
      title: "Complaint submitted",
      message: "CC-2026-001249 — Public toilet at market has no water supply was registered successfully.",
      complaint: byId("CC-2026-001249"),
      daysAgo: 15,
      read: false,
    },
    {
      type: "officer_assigned",
      title: "Officer assigned",
      message: "Arun Kumar (Assistant Engineer — Electrical) is now handling CC-2026-001247.",
      complaint: byId("CC-2026-001247"),
      daysAgo: 18,
      read: false,
    },
    {
      type: "status_changed",
      title: "Status changed to Under Review",
      message: "CC-2026-001248 is being verified by the Ward 78 control room.",
      complaint: byId("CC-2026-001248"),
      daysAgo: 15,
      read: true,
    },
    {
      type: "complaint_resolved",
      title: "Complaint resolved",
      message: "CC-2026-001246 — pothole on 80 Feet Road has been patched. Please rate the resolution.",
      complaint: byId("CC-2026-001246"),
      daysAgo: 26,
      read: true,
    },
    {
      type: "feedback_thanks",
      title: "Thanks for your feedback",
      message: "You rated the resolution of CC-2026-001246 five stars.",
      complaint: byId("CC-2026-001246"),
      daysAgo: 25,
      read: true,
    },
  ];

  for (const n of notifDefs) {
    const createdAt = new Date(Date.now() - n.daysAgo * 24 * 60 * 60 * 1000);
    await Notification.create({
      user: citizen._id,
      type: n.type,
      title: n.title,
      message: n.message,
      complaint: n.complaint?._id,
      read: n.read,
      createdAt,
      updatedAt: createdAt,
    });
  }

  console.log("\nSeed complete! Demo logins:");
  console.log("  Citizen -> ananya.sharma@gmail.com / password123");
  console.log("  Officer -> ramesh.iyer@civicconnect.gov.in / password123");
  console.log("  Admin   -> admin@civicconnect.gov.in / password123");
  console.log("\nAdmin dashboard covers: overview stats, all-complaints oversight with officer");
  console.log("reassignment, officer management (create/edit/deactivate/remove), and ward +");
  console.log("category analytics — all under /admin/* routes, separate from the officer views.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
